/**
 * Type definitions for flomo memo data
 */

export interface FlomoMemo {
    /** Unique identifier for the memo */
    id: string;
    /** Raw HTML content of the memo */
    content: string;
    /** Parsed plain text content */
    plainText: string;
    /** Tags extracted from the memo (e.g. #tag/subtag) */
    tags: string[];
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Image URLs found in the memo */
    images: string[];
    /** Whether this memo contains highlighted text */
    hasHighlight: boolean;
}

export interface FlomoExportData {
    /** All memos parsed from the export */
    memos: FlomoMemo[];
    /** Total count of memos */
    totalCount: number;
    /** Export source type */
    source: 'html' | 'api';
}

export interface SyncState {
    /** Timestamp of last successful sync */
    lastSyncTime: number;
    /** Set of memo IDs already imported */
    importedMemoIds: string[];
    /** Number of memos imported in total */
    totalImported: number;
}
