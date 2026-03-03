import { App, Notice } from 'obsidian';
import { FlomoApiClient } from './flomo-api';
import { FileWriter } from '../converter/file-writer';
import { SyncState } from '../parser/memo-types';

/**
 * Manages periodic sync of memos from flomo API to vault.
 */
export class SyncEngine {
    private syncTimer: ReturnType<typeof setInterval> | null = null;
    private isSyncing = false;

    constructor(
        private app: App,
        private getToken: () => string,
        private getImportPath: () => string,
        private getMergeByDate: () => boolean,
        private getDownloadImages: () => boolean,
        private getImageFolder: () => string,
        private getSyncStartDate: () => string,
        private getSyncState: () => SyncState,
        private saveSyncState: (state: SyncState) => Promise<void>,
    ) { }

    /**
     * Start periodic auto-sync with the given interval.
     */
    startAutoSync(intervalMinutes: number): void {
        this.stopAutoSync();
        const intervalMs = intervalMinutes * 60 * 1000;

        this.syncTimer = setInterval(() => {
            this.syncNow();
        }, intervalMs);

        // Do NOT do an immediate sync on plugin load (user request)
        // this.syncNow();
    }

    /**
     * Stop periodic auto-sync.
     */
    stopAutoSync(): void {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    /**
     * Perform a single sync operation.
     *
     * Sync logic:
     * 1. If lastSyncTime > 0: incremental sync (only memos updated since last sync)
     * 2. If syncStartDate is set: sync all memos from that date onward
     * 3. Otherwise: full sync (all memos)
     *
     * All fetched memos are written using upsert logic (create or update).
     */
    async syncNow(): Promise<void> {
        if (this.isSyncing) {
            new Notice('⏳ Flomo 同步正在进行中...');
            return;
        }

        const token = this.getToken();
        if (!token) {
            new Notice('❌ 请先配置 flomo authorization token');
            return;
        }

        this.isSyncing = true;
        const syncState = this.getSyncState();

        try {
            const client = new FlomoApiClient(token);

            // Test connection first
            const connected = await client.testConnection();
            if (!connected) {
                new Notice('❌ 无法连接到 flomo API，请检查 token 是否有效');
                return;
            }

            new Notice('🔄 正在从 flomo 同步笔记...');

            // Determine the timestamp to sync from
            let syncFromTimestamp = 0;
            const syncStartDate = this.getSyncStartDate();

            if (syncState.lastSyncTime > 0) {
                // Incremental sync: use last sync time
                syncFromTimestamp = syncState.lastSyncTime;
            } else if (syncStartDate) {
                // Use configured start date
                const startDate = new Date(syncStartDate + 'T00:00:00');
                if (!isNaN(startDate.getTime())) {
                    syncFromTimestamp = startDate.getTime();
                }
            }

            let memos;
            if (syncFromTimestamp > 0) {
                memos = await client.fetchNewMemos(
                    syncFromTimestamp,
                    (count) => { /* progress */ }
                );
            } else {
                memos = await client.fetchAllMemos(
                    (count) => { /* progress */ }
                );
            }

            // Client-side filter by start date (safety net)
            if (syncStartDate && memos.length > 0) {
                const cutoffDate = new Date(syncStartDate + 'T00:00:00');
                if (!isNaN(cutoffDate.getTime())) {
                    memos = memos.filter(m => m.createdAt >= cutoffDate);
                }
            }

            if (memos.length === 0) {
                new Notice('✅ Flomo 没有新笔记需要同步');
                return;
            }

            // Write memos to vault (always upsert: create or update)
            const writer = new FileWriter(
                this.app,
                this.getImportPath(),
                this.getMergeByDate(),
                this.getDownloadImages(),
                this.getImageFolder(),
            );

            const written = await writer.writeMemos(memos, syncState);

            // Update sync state
            syncState.lastSyncTime = Date.now();
            await this.saveSyncState(syncState);

            new Notice(`✅ 成功同步 ${written} 条 flomo 笔记`);
        } catch (error) {
            console.error('Flomo sync error:', error);
            new Notice(`❌ Flomo 同步失败: ${(error as Error).message}`);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Reset sync state and perform a full re-sync.
     * This clears all tracking data so ALL memos will be re-fetched
     * and re-written (existing files will be updated).
     */
    async fullResync(): Promise<void> {
        const syncState = this.getSyncState();
        syncState.lastSyncTime = 0;
        syncState.importedMemoIds = [];
        syncState.totalImported = 0;
        await this.saveSyncState(syncState);
        await this.syncNow();
    }
}
