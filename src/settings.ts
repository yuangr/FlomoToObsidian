import { App, PluginSettingTab, Setting, TextComponent, ToggleComponent } from 'obsidian';
import type FlomoToObsidianPlugin from './main';

/**
 * Plugin settings interface.
 */
export interface FlomoPluginSettings {
    /** Target folder for imported memos */
    importPath: string;
    /** Whether to merge memos by date into daily files */
    mergeByDate: boolean;
    /** Authorization token for flomo API */
    apiToken: string;
    /** Whether auto-sync is enabled */
    autoSyncEnabled: boolean;
    /** Auto-sync interval in minutes */
    autoSyncInterval: number;
    /** Whether to download images to local vault */
    downloadImages: boolean;
    /** Subfolder for downloaded images */
    imageFolder: string;
    /** Sync start date (YYYY-MM-DD format). Only sync memos from this date onward */
    syncStartDate: string;
}

export const DEFAULT_SETTINGS: FlomoPluginSettings = {
    importPath: 'flomo',
    mergeByDate: true,
    apiToken: '',
    autoSyncEnabled: false,
    autoSyncInterval: 30,
    downloadImages: false,
    imageFolder: 'flomo/attachments',
    syncStartDate: '',
};

/**
 * Settings tab UI for the flomo-to-obsidian plugin.
 */
export class FlomoSettingTab extends PluginSettingTab {
    plugin: FlomoToObsidianPlugin;

    constructor(app: App, plugin: FlomoToObsidianPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        // === General Settings ===
        containerEl.createEl('h2', { text: 'Flomo to Obsidian 设置' });

        new Setting(containerEl)
            .setName('导入目标文件夹')
            .setDesc('flomo 笔记将被保存到这个文件夹中')
            .addText((text: TextComponent) => text
                .setPlaceholder('flomo')
                .setValue(this.plugin.settings.importPath)
                .onChange(async (value: string) => {
                    this.plugin.settings.importPath = value || 'flomo';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('按日期合并')
            .setDesc('将同一天的 memo 合并到一个文件中，而不是每条 memo 一个文件')
            .addToggle((toggle: ToggleComponent) => toggle
                .setValue(this.plugin.settings.mergeByDate)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.mergeByDate = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('下载图片')
            .setDesc('将 memo 中的图片下载到本地 vault')
            .addToggle((toggle: ToggleComponent) => toggle
                .setValue(this.plugin.settings.downloadImages)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.downloadImages = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('图片文件夹')
            .setDesc('下载的图片保存位置')
            .addText((text: TextComponent) => text
                .setPlaceholder('flomo/attachments')
                .setValue(this.plugin.settings.imageFolder)
                .onChange(async (value: string) => {
                    this.plugin.settings.imageFolder = value || 'flomo/attachments';
                    await this.plugin.saveSettings();
                }));

        // === Auto Sync Settings ===
        containerEl.createEl('h2', { text: '🔄 自动同步' });

        // Login status display
        const isLoggedIn = !!this.plugin.settings.apiToken;
        const statusSetting = new Setting(containerEl)
            .setName('登录状态')
            .setDesc(isLoggedIn ? '✅ 已登录 flomo，可以自动同步' : '❌ 未登录，请先登录 flomo 账号');

        // Login / Logout button
        new Setting(containerEl)
            .setName(isLoggedIn ? '重新登录' : '登录 flomo')
            .setDesc('点击按钮打开 flomo 登录窗口，登录后自动获取同步凭证')
            .addButton(button => button
                .setButtonText(isLoggedIn ? '🔄 重新登录' : '🔑 登录 flomo')
                .setCta()
                .onClick(async () => {
                    button.setButtonText('⏳ 登录中...');
                    button.setDisabled(true);
                    const success = await this.plugin.loginToFlomo();
                    // Refresh the settings display
                    this.display();
                }));

        // Manual token input (fallback)
        const manualDetails = containerEl.createEl('details');
        manualDetails.style.marginBottom = '16px';
        manualDetails.style.padding = '8px 12px';
        manualDetails.style.borderRadius = '6px';
        manualDetails.style.background = 'var(--background-secondary)';

        const summary = manualDetails.createEl('summary', {
            text: '📋 手动输入 Token（自动登录不可用时）',
        });
        summary.style.cursor = 'pointer';
        summary.style.fontWeight = '500';
        summary.style.fontSize = '0.9em';

        const steps = manualDetails.createEl('div');
        steps.style.marginTop = '8px';
        steps.style.fontSize = '0.85em';
        steps.style.color = 'var(--text-muted)';
        steps.innerHTML = `
            <p><b>获取步骤：</b></p>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>在浏览器中打开 <a href="https://v.flomoapp.com/login">v.flomoapp.com</a> 并登录</li>
                <li>按 <b>F12</b> 打开开发者工具 → 切换到 <b>Network（网络）</b>面板</li>
                <li>在 flomo 中随便操作一下（如刷新页面）</li>
                <li>在 Network 列表中点击任意一个 <b>api</b> 请求</li>
                <li>在右侧 Headers 中找到 <b>Authorization</b> 的值（以 Bearer 开头）</li>
                <li>复制完整的值粘贴到下方输入框</li>
            </ol>
        `;

        new Setting(manualDetails)
            .setName('Authorization Token')
            .addText((text: TextComponent) => text
                .setPlaceholder('Bearer xxx...')
                .setValue(this.plugin.settings.apiToken)
                .onChange(async (value: string) => {
                    this.plugin.settings.apiToken = value;
                    await this.plugin.saveSettings();
                    // Refresh status display
                    this.display();
                }));

        if (isLoggedIn) {
            // Manual sync button
            new Setting(containerEl)
                .setName('立即同步')
                .setDesc('手动触发一次 flomo 笔记同步')
                .addButton(button => button
                    .setButtonText('📥 立即同步')
                    .onClick(async () => {
                        button.setButtonText('⏳ 同步中...');
                        button.setDisabled(true);
                        await this.plugin.syncFromApi();
                        button.setButtonText('📥 立即同步');
                        button.setDisabled(false);
                    }));

            // Logout button
            new Setting(containerEl)
                .setName('退出登录')
                .setDesc('清除保存的登录凭证并停止自动同步')
                .addButton(button => button
                    .setButtonText('退出登录')
                    .setWarning()
                    .onClick(async () => {
                        this.plugin.settings.apiToken = '';
                        this.plugin.settings.autoSyncEnabled = false;
                        this.plugin.stopAutoSync();
                        await this.plugin.saveSettings();
                        this.display();
                    }));
        }

        // Separator
        containerEl.createEl('h3', { text: '同步设置' });

        new Setting(containerEl)
            .setName('同步起始日期')
            .setDesc('只同步该日期之后的笔记。留空则同步全部笔记。修改后会自动重置同步状态')
            .addText((text: TextComponent) => text
                .setPlaceholder('YYYY-MM-DD（如 2024-01-01）')
                .setValue(this.plugin.settings.syncStartDate)
                .onChange(async (value: string) => {
                    // Validate date format
                    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        return;
                    }
                    this.plugin.settings.syncStartDate = value;
                    await this.plugin.saveSettings();
                    // Auto-reset sync state when start date changes
                    await this.plugin.resetSyncState();
                }));

        new Setting(containerEl)
            .setName('重置同步状态')
            .setDesc('清除同步记录，下次同步将重新拉取所有笔记（从起始日期开始）')
            .addButton(button => button
                .setButtonText('🔄 重置同步状态')
                .setWarning()
                .onClick(async () => {
                    await this.plugin.resetSyncState();
                    new (require('obsidian').Notice)('✅ 同步状态已重置，下次同步将重新拉取笔记');
                }));

        new Setting(containerEl)
            .setName('启用自动同步')
            .setDesc('定期从 flomo 拉取新笔记（需要先登录）')
            .addToggle((toggle: ToggleComponent) => toggle
                .setValue(this.plugin.settings.autoSyncEnabled)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.autoSyncEnabled = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        if (!this.plugin.settings.apiToken) {
                            const loggedIn = await this.plugin.loginToFlomo();
                            if (!loggedIn) {
                                toggle.setValue(false);
                                this.plugin.settings.autoSyncEnabled = false;
                                await this.plugin.saveSettings();
                                return;
                            }
                        }
                        this.plugin.startAutoSync();
                    } else {
                        this.plugin.stopAutoSync();
                    }
                }));

        new Setting(containerEl)
            .setName('同步间隔（分钟）')
            .setDesc('自动同步的间隔时间')
            .addText((text: TextComponent) => text
                .setPlaceholder('30')
                .setValue(String(this.plugin.settings.autoSyncInterval))
                .onChange(async (value: string) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 1) {
                        this.plugin.settings.autoSyncInterval = num;
                        await this.plugin.saveSettings();
                    }
                }));
    }
}
