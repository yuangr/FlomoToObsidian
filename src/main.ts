import { Plugin, Notice, TFile, normalizePath } from 'obsidian';
import { FlomoPluginSettings, DEFAULT_SETTINGS, FlomoSettingTab } from './settings';
import { FlomoHtmlParser } from './parser/html-parser';
import { FileWriter } from './converter/file-writer';
import { SyncEngine } from './sync/sync-engine';
import { SyncState } from './parser/memo-types';
import { openFlomoLogin, validateToken } from './sync/flomo-login';

/**
 * Plugin data stored in data.json
 */
interface FlomoPluginData {
    settings: FlomoPluginSettings;
    syncState: SyncState;
}

const DEFAULT_SYNC_STATE: SyncState = {
    lastSyncTime: 0,
    importedMemoIds: [],
    totalImported: 0,
};

/**
 * Main plugin class: Flomo to Obsidian
 * 
 * Features:
 * 1. Import flomo HTML export and convert to Markdown
 * 2. Auto-sync via flomo API (experimental)
 */
export default class FlomoToObsidianPlugin extends Plugin {
    settings: FlomoPluginSettings = DEFAULT_SETTINGS;
    private syncState: SyncState = { ...DEFAULT_SYNC_STATE };
    private syncEngine: SyncEngine | null = null;

    async onload() {
        await this.loadSettings();

        // Add ribbon icon for quick sync
        this.addRibbonIcon('refresh-cw', 'Flomo: 同步笔记', async () => {
            if (!this.settings.apiToken) {
                await this.loginToFlomo();
            } else {
                await this.syncFromApi();
            }
        });

        // Register commands
        this.addCommand({
            id: 'login-flomo',
            name: '登录 flomo 账号',
            callback: () => this.loginToFlomo(),
        });

        this.addCommand({
            id: 'import-flomo-html',
            name: '导入 flomo HTML 导出文件',
            callback: () => this.importFromHtml(),
        });

        this.addCommand({
            id: 'sync-flomo-api',
            name: '从 flomo API 同步笔记',
            callback: () => this.syncFromApi(),
        });

        this.addCommand({
            id: 'full-resync-flomo',
            name: '完整重新同步 flomo 笔记（清除同步状态）',
            callback: () => this.fullResync(),
        });

        // Settings tab
        this.addSettingTab(new FlomoSettingTab(this.app, this));

        // Initialize sync engine
        this.syncEngine = new SyncEngine(
            this.app,
            () => this.settings.apiToken,
            () => this.settings.importPath,
            () => this.settings.mergeByDate,
            () => this.settings.downloadImages,
            () => this.settings.imageFolder,
            () => this.settings.syncStartDate,
            () => this.syncState,
            async (state: SyncState) => {
                this.syncState = state;
                await this.saveData({
                    settings: this.settings,
                    syncState: this.syncState,
                } as FlomoPluginData);
            },
        );

        // Start auto-sync if enabled and token exists
        if (this.settings.autoSyncEnabled && this.settings.apiToken) {
            // Validate token first, re-login if expired
            const isValid = await validateToken(this.settings.apiToken);
            if (isValid) {
                this.startAutoSync();
            } else {
                new Notice('⚠️ Flomo token 已过期，请重新登录');
                this.settings.apiToken = '';
                await this.saveSettings();
            }
        }

        console.log('Flomo to Obsidian plugin loaded');
    }

    onunload() {
        this.stopAutoSync();
        console.log('Flomo to Obsidian plugin unloaded');
    }

    // === Public methods (called from settings tab) ===

    /**
     * Reset sync state so next sync will re-fetch all memos.
     */
    async resetSyncState() {
        this.syncState = {
            lastSyncTime: 0,
            importedMemoIds: [],
            totalImported: 0,
        };
        await this.saveData({
            settings: this.settings,
            syncState: this.syncState,
        } as FlomoPluginData);
    }

    /**
     * Open flomo login window to auto-capture auth token.
     */
    async loginToFlomo(): Promise<boolean> {
        new Notice('🔑 正在打开 flomo 登录窗口...');

        try {
            const result = await openFlomoLogin(this.app);

            if (result.success && result.token) {
                this.settings.apiToken = result.token;
                await this.saveSettings();
                new Notice('✅ flomo 登录成功！Token 已自动保存');

                // Auto-enable sync and do first sync
                if (!this.settings.autoSyncEnabled) {
                    this.settings.autoSyncEnabled = true;
                    await this.saveSettings();
                }

                this.startAutoSync();
                return true;
            } else {
                new Notice(`❌ 登录失败: ${result.error || '未知错误'}`);
                return false;
            }
        } catch (error) {
            console.error('Flomo login error:', error);
            new Notice(`❌ 登录失败: ${(error as Error).message}`);
            return false;
        }
    }

    startAutoSync() {
        if (this.syncEngine) {
            this.syncEngine.startAutoSync(this.settings.autoSyncInterval);
            new Notice(`🔄 Flomo 自动同步已启动（每 ${this.settings.autoSyncInterval} 分钟）`);
        }
    }

    stopAutoSync() {
        if (this.syncEngine) {
            this.syncEngine.stopAutoSync();
        }
    }

    async saveSettings() {
        await this.saveData({
            settings: this.settings,
            syncState: this.syncState,
        } as FlomoPluginData);
    }

    // === Private methods ===

    private async loadSettings() {
        const data = await this.loadData() as FlomoPluginData | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
        this.syncState = Object.assign({}, DEFAULT_SYNC_STATE, data?.syncState);
    }

    /**
     * Import memos from a flomo HTML export file.
     * Opens a file picker dialog for the user to select the HTML file.
     */
    private async importFromHtml() {
        try {
            // Use the Electron file picker (desktop only)
            const electron = require('electron');
            const result = await electron.remote.dialog.showOpenDialog({
                title: '选择 flomo 导出的 HTML 文件',
                filters: [
                    { name: 'HTML 文件', extensions: ['html', 'htm'] },
                    { name: '所有文件', extensions: ['*'] },
                ],
                properties: ['openFile'],
            });

            if (result.canceled || result.filePaths.length === 0) {
                return;
            }

            const filePath = result.filePaths[0];
            new Notice('📖 正在读取 flomo 导出文件...');

            // Read the HTML file
            const fs = require('fs');
            const html = fs.readFileSync(filePath, 'utf-8');

            // Parse HTML
            const parser = new FlomoHtmlParser();
            const exportData = parser.parse(html);

            if (exportData.memos.length === 0) {
                new Notice('⚠️ 未在 HTML 文件中找到任何 memo');
                return;
            }

            new Notice(`📝 找到 ${exportData.totalCount} 条 memo，正在导入...`);

            // Write to vault
            const writer = new FileWriter(
                this.app,
                this.settings.importPath,
                this.settings.mergeByDate,
            );

            const written = await writer.writeMemos(exportData.memos, this.syncState);

            // Save updated sync state
            await this.saveSettings();

            if (written > 0) {
                new Notice(`✅ 成功导入 ${written} 条新 memo（共 ${this.syncState.totalImported} 条已导入）`);
            } else {
                new Notice('ℹ️ 所有 memo 已经导入过了，没有新内容');
            }

        } catch (error) {
            console.error('Failed to import flomo HTML:', error);
            new Notice(`❌ 导入失败: ${(error as Error).message}`);
        }
    }

    /**
     * Sync memos from flomo API.
     * If no token is set, prompt login first.
     */
    async syncFromApi() {
        if (!this.syncEngine) return;

        // Auto-login if no token
        if (!this.settings.apiToken) {
            const loggedIn = await this.loginToFlomo();
            if (!loggedIn) return;
        }

        await this.syncEngine.syncNow();
    }

    /**
     * Full re-sync: clear state and re-fetch everything from API.
     */
    private async fullResync() {
        if (!this.syncEngine) return;

        // Auto-login if no token
        if (!this.settings.apiToken) {
            const loggedIn = await this.loginToFlomo();
            if (!loggedIn) return;
        }

        await this.syncEngine.fullResync();
    }
}
