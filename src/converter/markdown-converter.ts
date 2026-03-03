import { FlomoMemo } from '../parser/memo-types';

/**
 * Converts FlomoMemo objects into Obsidian-compatible Markdown format.
 */
export class MarkdownConverter {

    /**
     * Convert a single memo to Markdown string with optional frontmatter.
     */
    convertMemo(memo: FlomoMemo, includeFrontmatter: boolean = true): string {
        const parts: string[] = [];

        if (includeFrontmatter) {
            parts.push(this.generateFrontmatter(memo));
        }

        // Process content: HTML to Markdown
        let markdownContent = this.htmlToMarkdown(memo.content);

        // Handle highlights
        markdownContent = this.convertHighlights(markdownContent);

        parts.push(markdownContent.trim());

        return parts.join('\n\n');
    }

    /**
     * Convert multiple memos into a single Markdown string, grouped under date headers.
     * Used when merging memos by date.
     */
    convertMemosByDate(memos: FlomoMemo[]): string {
        const parts: string[] = [];

        // Add frontmatter for the date file
        const date = memos[0]?.createdAt;
        if (date) {
            parts.push([
                '---',
                `date: ${this.formatDate(date)}`,
                `source: flomo`,
                `memo_count: ${memos.length}`,
                '---',
            ].join('\n'));
        }

        // Add each memo as a section
        for (const memo of memos) {
            const time = this.formatTime(memo.createdAt);
            let content = this.htmlToMarkdown(memo.content);
            content = this.convertHighlights(content);

            const tagsStr = memo.tags.map(t => `#${t.trim()}`).join(' ');
            const section = [
                `## ${time}`,
                '',
                content.trim(),
                '',
                tagsStr ? `${tagsStr}` : '',
                '',
                '---',
            ].filter(line => line !== undefined).join('\n');

            parts.push(section);
        }

        return parts.join('\n\n');
    }

    /**
     * Generate YAML frontmatter for a memo.
     */
    private generateFrontmatter(memo: FlomoMemo): string {
        const lines = [
            '---',
            `created: ${this.formatDateTime(memo.createdAt)}`,
            `updated: ${this.formatDateTime(memo.updatedAt)}`,
            `source: flomo`,
            `flomo_id: "${memo.id}"`,
        ];

        if (memo.tags.length > 0) {
            lines.push(`tags:`);
            for (const tag of memo.tags) {
                // Convert flomo's #tag/subtag to Obsidian's nested tag format
                lines.push(`  - "${tag.replace(/\//g, '/')}"`);
            }
        }

        lines.push('---');
        return lines.join('\n');
    }

    /**
     * Convert HTML content to Markdown.
     * Handles common HTML elements found in flomo exports.
     */
    private htmlToMarkdown(html: string): string {
        let md = html;

        // Remove flomo tag links to avoid duplicate tags in output
        // Tags are handled separately via memo.tags
        md = md.replace(/<a[^>]*class="[^"]*tag[^"]*"[^>]*>.*?<\/a>/gi, '');

        // Handle line breaks
        md = md.replace(/<br\s*\/?>/gi, '\n');

        // Handle paragraphs
        md = md.replace(/<\/p>\s*<p>/gi, '\n\n');
        md = md.replace(/<\/?p>/gi, '\n');

        // Handle bold
        md = md.replace(/<(?:b|strong)>(.*?)<\/(?:b|strong)>/gi, '**$1**');

        // Handle italic
        md = md.replace(/<(?:i|em)>(.*?)<\/(?:i|em)>/gi, '*$1*');

        // Handle strikethrough
        md = md.replace(/<(?:s|del|strike)>(.*?)<\/(?:s|del|strike)>/gi, '~~$1~~');

        // Handle unordered lists
        md = md.replace(/<li>(.*?)<\/li>/gi, '- $1');
        md = md.replace(/<\/?[uo]l>/gi, '\n');

        // Handle ordered lists (basic)
        let listCounter = 0;
        md = md.replace(/<ol>/gi, () => { listCounter = 0; return '\n'; });
        md = md.replace(/<li>(.*?)<\/li>/gi, () => `${++listCounter}. `);
        md = md.replace(/<\/ol>/gi, '\n');

        // Handle links
        md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

        // Handle images
        md = md.replace(/<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi,
            (_, src, alt) => `![${alt || ''}](${src})`);

        // Handle blockquotes
        md = md.replace(/<blockquote>(.*?)<\/blockquote>/gis, (_, content) => {
            return content.split('\n').map((line: string) => `> ${line}`).join('\n');
        });

        // Handle code blocks
        md = md.replace(/<pre><code>(.*?)<\/code><\/pre>/gis, '```\n$1\n```');
        md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');

        // Handle headings
        md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1');
        md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1');
        md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1');

        // Handle horizontal rules
        md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

        // Remove remaining HTML tags
        md = md.replace(/<[^>]+>/g, '');

        // Decode HTML entities
        md = this.decodeHtmlEntities(md);

        // Clean up excessive whitespace
        md = md.replace(/\n{3,}/g, '\n\n');
        md = md.trim();

        return md;
    }

    /**
     * Convert flomo highlight marks to Obsidian highlight syntax (==text==).
     */
    private convertHighlights(text: string): string {
        // Handle <span class="highlight">text</span> that may remain
        text = text.replace(/\[highlight\](.*?)\[\/highlight\]/gi, '==$1==');
        return text;
    }

    /**
     * Decode common HTML entities.
     */
    private decodeHtmlEntities(text: string): string {
        const entities: Record<string, string> = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' ',
            '&#x2F;': '/',
            '&apos;': "'",
        };

        for (const [entity, char] of Object.entries(entities)) {
            text = text.replace(new RegExp(entity, 'g'), char);
        }

        // Handle numeric entities
        text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
        text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

        return text;
    }

    /**
     * Format date as YYYY-MM-DD.
     */
    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Format time as HH:MM.
     */
    private formatTime(date: Date): string {
        return date.toTimeString().slice(0, 5);
    }

    /**
     * Format date and time as YYYY-MM-DD HH:MM:SS.
     */
    private formatDateTime(date: Date): string {
        return `${this.formatDate(date)} ${date.toTimeString().slice(0, 8)}`;
    }

    // === Public accessors for FileWriter ===

    htmlToMarkdownPublic(html: string): string {
        return this.htmlToMarkdown(html);
    }

    convertHighlightsPublic(text: string): string {
        return this.convertHighlights(text);
    }

    formatTimePublic(date: Date): string {
        return this.formatTime(date);
    }
}
