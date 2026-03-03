import { App, TFolder, normalizePath, Notice, requestUrl } from 'obsidian';
import { FlomoMemo, SyncState } from '../parser/memo-types';
import { MarkdownConverter } from './markdown-converter';

/**
 * Handles writing converted memos to the Obsidian vault.
 * Uses "upsert" logic: create new files or update existing ones.
 * For date-merged mode, new memos are appended to existing daily files.
 */
export class FileWriter {
    private converter: MarkdownConverter;

    constructor(
        private app: App,
        private importPath: string,
        private mergeByDate: boolean,
        private downloadImages: boolean = false,
        private imageFolder: string = 'flomo/attachments',
    ) {
        this.converter = new MarkdownConverter();
    }

    /**
     * Write memos to the vault using upsert logic.
     * Returns the number of written memos.
     */
    async writeMemos(memos: FlomoMemo[], syncState: SyncState): Promise<number> {
        await this.ensureFolder(this.importPath);

        if (memos.length === 0) {
            return 0;
        }

        // Download images if enabled, and replace remote URLs in HTML content
        if (this.downloadImages) {
            await this.ensureFolder(this.imageFolder);
            for (const memo of memos) {
                await this.downloadAndReplaceImages(memo);
            }
        }

        if (this.mergeByDate) {
            await this.writeMemosMergedByDate(memos, syncState);
        } else {
            await this.writeMemosIndividually(memos, syncState);
        }

        return memos.length;
    }



    /**
     * Write each memo as an individual Markdown file.
     */
    private async writeMemosIndividually(memos: FlomoMemo[], syncState: SyncState): Promise<void> {
        for (const memo of memos) {
            const fileName = this.generateFileName(memo);
            const filePath = normalizePath(`${this.importPath}/${fileName}`);
            const content = this.converter.convertMemo(memo, true);

            await this.upsertFile(filePath, content);

            if (!syncState.importedMemoIds.includes(memo.id)) {
                syncState.importedMemoIds.push(memo.id);
                syncState.totalImported++;
            }
        }
    }

    /**
     * Write memos grouped by date into daily files.
     * Key behavior: if a daily file already exists, NEW memos are APPENDED
     * to preserve existing content. Avoids duplicates by checking memo IDs.
     */
    private async writeMemosMergedByDate(memos: FlomoMemo[], syncState: SyncState): Promise<void> {
        // Group memos by date
        const dateGroups = new Map<string, FlomoMemo[]>();

        for (const memo of memos) {
            const dateKey = this.formatDateKey(memo.createdAt);
            const group = dateGroups.get(dateKey);
            if (group) {
                group.push(memo);
            } else {
                dateGroups.set(dateKey, [memo]);
            }
        }

        for (const [dateKey, dateMemos] of dateGroups) {
            const fileName = `flomo-${dateKey}.md`;
            const filePath = normalizePath(`${this.importPath}/${fileName}`);
            const existingFile = this.app.vault.getAbstractFileByPath(filePath);

            if (existingFile) {
                // File exists — User requested OVERWRITE of the file or matching sections.
                let existingContent = await this.app.vault.read(existingFile as any);

                // Group memos by their specific time (HH:MM) to handle multiple memos in the same minute
                const timeGroups = new Map<string, FlomoMemo[]>();
                for (const memo of dateMemos) {
                    const time = this.converter.formatTimePublic(memo.createdAt);
                    if (!timeGroups.has(time)) {
                        timeGroups.set(time, []);
                    }
                    timeGroups.get(time)!.push(memo);
                }

                for (const [timeKey, memosAtTime] of timeGroups.entries()) {
                    // Build a single section for all memos sharing this minute
                    const contentParts = [];
                    for (const memo of memosAtTime) {
                        let content = this.converter.htmlToMarkdownPublic(memo.content);
                        content = this.converter.convertHighlightsPublic(content);
                        const tagsStr = memo.tags.map(t => `#${t.trim()}`).join(' ');

                        let combinedMemoContent = content.trim();
                        if (tagsStr) combinedMemoContent += '\n\n' + tagsStr;
                        contentParts.push(combinedMemoContent);

                        // Always track memo IDs
                        if (!syncState.importedMemoIds.includes(memo.id)) {
                            syncState.importedMemoIds.push(memo.id);
                            syncState.totalImported++;
                        }
                    }

                    // Join multiple memos from the exact same minute with a blank line
                    const combinedContent = contentParts.join('\n\n');

                    const newSection = [
                        `## ${timeKey}`,
                        '',
                        combinedContent,
                        '',
                        '---'
                    ].join('\n');

                    // Check if a section for this time already exists
                    // match `## HH:MM` and everything up to and INCLUDING the `---` and any following newlines
                    // or up to the next `## ` if no `---` is explicitly found
                    const sectionRegex = new RegExp(`## ${timeKey}\\b[\\s\\S]*?(?:---\\s*|(?=## \\d{2}:\\d{2}))`, 'g');

                    if (sectionRegex.test(existingContent)) {
                        sectionRegex.lastIndex = 0; // Reset lastIndex after test()
                        // Overwrite existing section. newSection already ends with '---'
                        existingContent = existingContent.replace(sectionRegex, newSection + '\n\n');
                    } else {
                        // Append new section if not found
                        existingContent = existingContent.trimEnd() + '\n\n' + newSection + '\n\n';
                    }
                }

                // Update the memo_count in frontmatter
                const totalCount = (existingContent.match(/^## \d{2}:\d{2}/gm) || []).length;
                let updatedContent = existingContent.replace(
                    /memo_count: \d+/,
                    `memo_count: ${totalCount}`
                );

                await this.app.vault.modify(existingFile as any, updatedContent);
            } else {
                // File doesn't exist — create with all memos
                const content = this.converter.convertMemosByDate(dateMemos);
                await this.app.vault.create(filePath, content);

                for (const memo of dateMemos) {
                    if (!syncState.importedMemoIds.includes(memo.id)) {
                        syncState.importedMemoIds.push(memo.id);
                        syncState.totalImported++;
                    }
                }
            }
        }
    }

    /**
     * Download images from a memo and replace <img> tags in the HTML content
     * with Obsidian embed syntax (![[path]]). This ensures the generated markdown
     * correctly references local vault files.
     */
    private async downloadAndReplaceImages(memo: FlomoMemo): Promise<void> {
        // Extract image URLs from <img> tags in HTML content
        const imgRegex = /<img[^>]*src="([^"]+)"[^>]*\/?>/gi;
        const imageUrls: { url: string; fullTag: string }[] = [];
        let match;
        while ((match = imgRegex.exec(memo.content)) !== null) {
            if (match[1]) {
                imageUrls.push({ url: match[1], fullTag: match[0] });
            }
        }

        // Also include URLs from memo.images (files array) that aren't in <img> tags
        if (memo.images) {
            for (const url of memo.images) {
                if (url && !imageUrls.some(item => item.url === url)) {
                    imageUrls.push({ url, fullTag: '' });
                }
            }
        }

        if (imageUrls.length === 0) return;

        const localPaths: string[] = [];
        for (let i = 0; i < imageUrls.length; i++) {
            const { url: imageUrl, fullTag } = imageUrls[i];
            if (!imageUrl || imageUrl.startsWith('file://') || !imageUrl.startsWith('http')) continue;

            try {
                const ext = this.getImageExtension(imageUrl);
                const timestamp = memo.createdAt.getTime();
                const imageName = `flomo-${timestamp}-${i}${ext}`;
                const localPath = normalizePath(`${this.imageFolder}/${imageName}`);

                // Download if not already present
                if (!this.app.vault.getAbstractFileByPath(localPath)) {
                    const response = await requestUrl({ url: imageUrl });
                    if (response.status === 200) {
                        await this.app.vault.createBinary(localPath, response.arrayBuffer);
                    }
                }

                // Replace the entire <img> tag with Obsidian embed syntax, or append it if not in HTML
                if (fullTag) {
                    memo.content = this.replaceAll(memo.content, fullTag, `![[${localPath}]]`);
                } else {
                    memo.content += `<br>![[${localPath}]]`;
                }
                localPaths.push(localPath);
            } catch (e) {
                console.warn(`Failed to download image: ${imageUrl}`, e);
            }
        }
        // Update memo.images with local paths
        memo.images = localPaths;
    }

    /**
     * Replace all occurrences of a string (not regex-based, safe for URLs).
     */
    private replaceAll(str: string, search: string, replacement: string): string {
        return str.split(search).join(replacement);
    }

    /**
     * Get file extension from image URL.
     */
    private getImageExtension(url: string): string {
        try {
            const pathname = new URL(url).pathname;
            const ext = pathname.split('.').pop()?.toLowerCase();
            if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
                return `.${ext}`;
            }
        } catch { }
        return '.png'; // Default
    }

    /**
     * Generate a file name for an individual memo.
     */
    private generateFileName(memo: FlomoMemo): string {
        const date = this.formatDateKey(memo.createdAt);
        const time = memo.createdAt.toTimeString().slice(0, 5).replace(':', '');

        let title = memo.plainText
            .replace(/#[\w\u4e00-\u9fa5/]+/g, '')
            .replace(/[\\/:*?"<>|]/g, '')
            .trim()
            .slice(0, 30)
            .trim();

        if (!title) {
            title = 'memo';
        }

        return `flomo-${date}-${time}-${title}.md`;
    }

    /**
     * Upsert a file: create if not exists, update if exists.
     */
    private async upsertFile(filePath: string, content: string): Promise<void> {
        const existingFile = this.app.vault.getAbstractFileByPath(filePath);
        if (existingFile) {
            await this.app.vault.modify(existingFile as any, content);
        } else {
            await this.app.vault.create(filePath, content);
        }
    }

    /**
     * Ensure the target folder exists, creating it if necessary.
     */
    private async ensureFolder(folderPath: string): Promise<void> {
        const normalizedPath = normalizePath(folderPath);
        const folder = this.app.vault.getAbstractFileByPath(normalizedPath);

        if (!folder) {
            // Create nested folders
            const parts = normalizedPath.split('/');
            let currentPath = '';
            for (const part of parts) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                const existing = this.app.vault.getAbstractFileByPath(currentPath);
                if (!existing) {
                    await this.app.vault.createFolder(currentPath);
                }
            }
        } else if (!(folder instanceof TFolder)) {
            throw new Error(`Path "${normalizedPath}" exists but is not a folder.`);
        }
    }

    /**
     * Format date as YYYY-MM-DD for file naming and grouping.
     */
    private formatDateKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
