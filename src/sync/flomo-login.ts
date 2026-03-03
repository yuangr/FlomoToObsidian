/**
 * Flomo Login Module
 *
 * Uses an Obsidian Modal with an embedded <webview> to handle login.
 * After the user logs in, extracts the access_token from localStorage's
 * `me` field which contains the user profile with the token.
 *
 * Discovery: flomo stores auth info in localStorage under key "me"
 * as JSON: {"id":xxx, "access_token":"xxx|yyy", ...}
 * The Authorization header format is: "Bearer <access_token>"
 */

import { Modal, App, Notice } from 'obsidian';

export interface LoginResult {
    success: boolean;
    token: string;
    error?: string;
}

/**
 * Modal that embeds a webview loading the flomo login page.
 * After login, extracts the token from localStorage.
 */
class FlomoLoginModal extends Modal {
    private resolvePromise: ((result: LoginResult) => void) | null = null;
    private resolved = false;
    private pollTimer: ReturnType<typeof setInterval> | null = null;

    constructor(app: App) {
        super(app);
    }

    waitForLogin(): Promise<LoginResult> {
        return new Promise<LoginResult>((resolve) => {
            this.resolvePromise = resolve;
            this.open();
        });
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // Style the modal
        this.modalEl.style.width = '460px';
        this.modalEl.style.height = '700px';
        this.modalEl.style.maxWidth = '90vw';
        this.modalEl.style.maxHeight = '90vh';

        contentEl.createEl('h3', { text: '🔑 登录 flomo' });

        const desc = contentEl.createEl('p', {
            text: '请在下方登录 flomo 账号，登录成功后将自动获取同步凭证。',
        });
        desc.style.fontSize = '0.85em';
        desc.style.color = 'var(--text-muted)';
        desc.style.marginBottom = '12px';

        // Create webview container
        const webviewContainer = contentEl.createEl('div');
        webviewContainer.style.width = '100%';
        webviewContainer.style.height = '550px';
        webviewContainer.style.border = '1px solid var(--background-modifier-border)';
        webviewContainer.style.borderRadius = '8px';
        webviewContainer.style.overflow = 'hidden';

        // Create webview element
        const webview = document.createElement('webview') as any;
        webview.setAttribute('src', 'https://v.flomoapp.com/login');
        webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        webview.style.width = '100%';
        webview.style.height = '100%';
        webview.style.border = 'none';

        webviewContainer.appendChild(webview);

        // Wait for webview to be ready, then start polling for token
        webview.addEventListener('dom-ready', () => {
            this.startTokenPolling(webview);
        });

        // Also listen for navigation (user logged in and redirected)
        webview.addEventListener('did-navigate', () => {
            this.checkForToken(webview);
        });

        webview.addEventListener('did-navigate-in-page', () => {
            this.checkForToken(webview);
        });
    }

    /**
     * Poll the webview's localStorage for the token every 2 seconds.
     * Flomo stores user info in localStorage under key "me" with an
     * "access_token" field.
     */
    private startTokenPolling(webview: any) {
        // Check immediately
        setTimeout(() => this.checkForToken(webview), 1000);

        // Then poll every 2 seconds
        this.pollTimer = setInterval(() => {
            if (this.resolved) {
                if (this.pollTimer) clearInterval(this.pollTimer);
                return;
            }
            this.checkForToken(webview);
        }, 2000);
    }

    /**
     * Check if token is available in the webview's localStorage.
     */
    private async checkForToken(webview: any) {
        if (this.resolved) return;

        try {
            // Extract token from localStorage "me" field
            const token = await webview.executeJavaScript(`
				(function() {
					try {
						// Primary method: read from localStorage "me" field
						var meStr = localStorage.getItem('me');
						if (meStr) {
							var me = JSON.parse(meStr);
							if (me && me.access_token) {
								return 'Bearer ' + me.access_token;
							}
						}

						// Fallback: scan all localStorage keys for tokens
						for (var i = 0; i < localStorage.length; i++) {
							var key = localStorage.key(i);
							var val = localStorage.getItem(key);
							if (!val) continue;
							
							// Try parsing as JSON to find access_token
							try {
								var obj = JSON.parse(val);
								if (obj && obj.access_token) {
									return 'Bearer ' + obj.access_token;
								}
							} catch(e) {}
							
							// Check for raw token values
							if (key.toLowerCase().includes('token') && val.length > 20 && !val.includes('<')) {
								return val.startsWith('Bearer ') ? val : 'Bearer ' + val;
							}
						}

						return null;
					} catch(e) {
						return null;
					}
				})()
			`);

            if (token && typeof token === 'string' && token.length > 20) {
                this.finishLogin(token);
            }
        } catch (e) {
            // Webview might not be ready yet
        }
    }

    private finishLogin(token: string) {
        if (this.resolved) return;
        this.resolved = true;

        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }

        if (this.resolvePromise) {
            this.resolvePromise({
                success: true,
                token: token,
            });
        }

        setTimeout(() => this.close(), 500);
    }

    onClose() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }

        if (!this.resolved && this.resolvePromise) {
            this.resolved = true;
            this.resolvePromise({
                success: false,
                token: '',
                error: '登录窗口已关闭',
            });
        }

        this.contentEl.empty();
    }
}

/**
 * Open a flomo login modal and capture the auth token.
 */
export function openFlomoLogin(app: App): Promise<LoginResult> {
    const modal = new FlomoLoginModal(app);
    return modal.waitForLogin();
}

/**
 * Validate whether a stored token is still valid by making a test API call.
 */
export async function validateToken(token: string): Promise<boolean> {
    try {
        const { FlomoApiClient } = require('./flomo-api');
        const client = new FlomoApiClient(token);
        return await client.testConnection();
    } catch {
        return false;
    }
}
