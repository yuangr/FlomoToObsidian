import { FlomoMemo, FlomoExportData } from './memo-types';

/**
 * Parses flomo exported HTML file into structured memo data.
 * 
 * Flomo HTML export structure:
 * <div class="memo">
 *   <div class="time">2024-01-01 12:00:00</div>
 *   <div class="content">
 *     <p>Memo text with #tag and <span class="highlight">highlights</span></p>
 *   </div>
 * </div>
 */
export class FlomoHtmlParser {

    /**
     * Parse a complete flomo HTML export string into structured data.
     */
    parse(html: string): FlomoExportData {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const memoElements = doc.querySelectorAll('.memo');

        const memos: FlomoMemo[] = [];

        memoElements.forEach((memoEl, index) => {
            const memo = this.parseMemoElement(memoEl, index);
            if (memo) {
                memos.push(memo);
            }
        });

        return {
            memos,
            totalCount: memos.length,
            source: 'html',
        };
    }

    /**
     * Parse a single memo DOM element into a FlomoMemo object.
     */
    private parseMemoElement(el: Element, index: number): FlomoMemo | null {
        const timeEl = el.querySelector('.time');
        const contentEl = el.querySelector('.content');

        if (!contentEl) {
            return null;
        }

        const timeText = timeEl?.textContent?.trim() || '';
        const createdAt = this.parseTime(timeText);
        const content = contentEl.innerHTML.trim();
        const plainText = contentEl.textContent?.trim() || '';
        const tags = this.extractTags(plainText);
        const images = this.extractImages(contentEl);
        const hasHighlight = contentEl.querySelector('.highlight') !== null
            || contentEl.innerHTML.includes('background-color');

        // Generate a deterministic ID from timestamp + index
        const id = this.generateMemoId(timeText, index);

        return {
            id,
            content,
            plainText,
            tags,
            createdAt,
            updatedAt: createdAt,
            images,
            hasHighlight,
        };
    }

    /**
     * Parse flomo time format: "2024-01-01 12:00:00" or similar.
     */
    private parseTime(timeText: string): Date {
        if (!timeText) {
            return new Date();
        }
        const parsed = new Date(timeText.replace(/\//g, '-'));
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    /**
     * Extract tags from memo text. Flomo uses #tag and #tag/subtag format.
     */
    private extractTags(text: string): string[] {
        const tagRegex = /#([\w\u4e00-\u9fa5][\w\u4e00-\u9fa5/]*)/g;
        const tags: string[] = [];
        let match;

        while ((match = tagRegex.exec(text)) !== null) {
            const tag = match[1];
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        }

        return tags;
    }

    /**
     * Extract image URLs from memo content.
     */
    private extractImages(contentEl: Element): string[] {
        const images: string[] = [];
        const imgElements = contentEl.querySelectorAll('img');

        imgElements.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                images.push(src);
            }
        });

        return images;
    }

    /**
     * Generate a deterministic memo ID from timestamp and index.
     */
    private generateMemoId(timeText: string, index: number): string {
        const sanitized = timeText.replace(/[^0-9]/g, '');
        return `flomo-${sanitized}-${index}`;
    }
}
