import { requestUrl } from 'obsidian';
import { FlomoMemo } from '../parser/memo-types';
import { md5 } from './md5';

/**
 * Flomo API signing salt (extracted from flomo web client JS).
 */
const SIGN_SALT = 'dbbc3dd73364b4084c3a69346e0ce2b2';

/**
 * Response type for flomo API memo list endpoint.
 */
interface FlomoApiMemoResponse {
    code: number;
    message: string;
    data: FlomoApiMemo[];
}

/**
 * Single memo from the flomo API response.
 */
interface FlomoApiMemo {
    slug: string;
    content: string;
    tags: FlomoApiTag[];
    created_at: string;
    updated_at: string;
    linked_memos: any[];
    files: FlomoApiFile[];
}

interface FlomoApiTag {
    name: string;
}

interface FlomoApiFile {
    url: string;
    name: string;
    type: string;
}

/**
 * Client for the flomo API.
 * Implements the required signing mechanism for all API calls.
 *
 * Every request needs these parameters:
 * - timestamp: current Unix timestamp in seconds
 * - api_key: "flomo_web"
 * - app_version: "4.0"
 * - platform: "web"
 * - sign: MD5(sorted_params + salt)
 */
export class FlomoApiClient {
    private baseUrl = 'https://flomoapp.com/api/v1';

    constructor(private authToken: string) { }

    /**
     * Generate the sign parameter for a flomo API request.
     * 
     * Algorithm (reverse-engineered from flomo web client):
     * 1. Sort params alphabetically by key
     * 2. Concatenate as "key1=value1&key2=value2..."
     * 3. Remove trailing "&"
     * 4. Append the salt
     * 5. MD5 hash the result
     */
    private generateSign(params: Record<string, string | number>): string {
        const sortedKeys = Object.keys(params).sort();
        let str = '';
        for (const key of sortedKeys) {
            const val = params[key];
            if (val !== undefined && val !== null && val !== '') {
                str += `${key}=${val}&`;
            }
        }
        // Remove trailing '&'
        str = str.substring(0, str.length - 1);
        // Append salt and hash
        return md5(str + SIGN_SALT);
    }

    /**
     * Build a signed URL for an API request.
     */
    private buildSignedUrl(endpoint: string, extraParams: Record<string, string | number> = {}): string {
        const timestamp = Math.floor(Date.now() / 1000);

        const params: Record<string, string | number> = {
            timestamp,
            api_key: 'flomo_web',
            app_version: '4.0',
            platform: 'web',
            ...extraParams,
        };

        const sign = this.generateSign(params);
        params.sign = sign;

        const queryString = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');

        return `${this.baseUrl}${endpoint}?${queryString}`;
    }

    /**
     * Make a signed GET request to the flomo API.
     */
    private async signedGet(endpoint: string, extraParams: Record<string, string | number> = {}): Promise<any> {
        const url = this.buildSignedUrl(endpoint, extraParams);

        const response = await requestUrl({
            url,
            method: 'GET',
            headers: {
                'Authorization': this.authToken,
            },
        });

        if (response.status !== 200) {
            throw new Error(`Flomo API error: HTTP ${response.status}`);
        }

        const data = response.json;

        // Check if the response is actually HTML (redirect to login)
        if (typeof data === 'string' && (data as string).includes('<!DOCTYPE')) {
            throw new Error('Flomo API returned HTML instead of JSON - token may be invalid');
        }

        if (data.code && data.code !== 0) {
            throw new Error(`Flomo API error: ${data.message || 'Unknown error'}`);
        }

        return data;
    }

    /**
     * Fetch memos from flomo using the /memo/updated/ endpoint.
     * @param latestUpdatedAt - Unix timestamp (seconds). Pass "0" for all memos.
     * @param limit - Number of memos per page.
     */
    async fetchMemos(latestUpdatedAt: string = '0', limit: number = 200): Promise<{ memos: FlomoMemo[]; hasMore: boolean }> {
        const data = await this.signedGet('/memo/updated/', {
            limit,
            latest_updated_at: latestUpdatedAt,
            tz: '8:0',
            webp: 1,
        });

        const apiMemos: FlomoApiMemo[] = data.data || [];
        const memos = apiMemos.map(m => this.convertApiMemo(m));

        // If we got exactly `limit` memos, there might be more
        const hasMore = apiMemos.length >= limit;

        return { memos, hasMore };
    }

    /**
     * Fetch all memos from flomo (paginated via updated_at cursor).
     */
    async fetchAllMemos(onProgress?: (count: number) => void): Promise<FlomoMemo[]> {
        const allMemos: FlomoMemo[] = [];
        let latestUpdatedAt = '0';
        let hasMore = true;
        const limit = 200;

        while (hasMore) {
            const result = await this.fetchMemos(latestUpdatedAt, limit);
            allMemos.push(...result.memos);
            hasMore = result.hasMore;

            if (result.memos.length > 0) {
                // Use the last memo's updated_at as cursor for next page
                const lastMemo = result.memos[result.memos.length - 1];
                latestUpdatedAt = String(Math.floor(lastMemo.updatedAt.getTime() / 1000));
            }

            if (onProgress) {
                onProgress(allMemos.length);
            }

            // Rate limiting
            if (hasMore) {
                await this.sleep(500);
            }
        }

        return allMemos;
    }

    /**
     * Fetch memos updated after a specific timestamp.
     */
    async fetchNewMemos(afterTimestamp: number, onProgress?: (count: number) => void): Promise<FlomoMemo[]> {
        const latestUpdatedAt = String(Math.floor(afterTimestamp / 1000));
        const result = await this.fetchMemos(latestUpdatedAt, 200);

        if (onProgress) {
            onProgress(result.memos.length);
        }

        return result.memos;
    }

    /**
     * Test the API connection with the current token.
     */
    async testConnection(): Promise<boolean> {
        try {
            // Use user/me endpoint for a lightweight test
            await this.signedGet('/user/me');
            return true;
        } catch (e) {
            console.error('Flomo API test connection failed:', e);
            return false;
        }
    }

    /**
     * Convert an API memo to our internal FlomoMemo format.
     */
    private convertApiMemo(apiMemo: FlomoApiMemo): FlomoMemo {
        const plainText = apiMemo.content
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();

        const images = (apiMemo.files || [])
            .filter(f => f.type && f.type.startsWith('image'))
            .map(f => f.url);

        const tags = (apiMemo.tags || []).map(t => (typeof t === 'string' ? t : t.name).trim());

        return {
            id: `flomo-api-${apiMemo.slug}`,
            content: apiMemo.content,
            plainText,
            tags,
            createdAt: new Date(apiMemo.created_at),
            updatedAt: new Date(apiMemo.updated_at),
            images,
            hasHighlight: apiMemo.content.includes('background-color')
                || apiMemo.content.includes('class="highlight"'),
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
