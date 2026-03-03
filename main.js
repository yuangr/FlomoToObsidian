var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/sync/md5.ts
function safeAdd(x, y) {
  const lsw = (x & 65535) + (y & 65535);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
function binlMD5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[(len + 64 >>> 9 << 4) + 14] = len;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function rstrMD5(s) {
  const input = [];
  for (let i = 0; i < s.length * 8; i += 8) {
    input[i >> 5] |= (s.charCodeAt(i / 8) & 255) << i % 32;
  }
  const output = binlMD5(input, s.length * 8);
  let result = "";
  for (let i = 0; i < output.length * 32; i += 8) {
    result += String.fromCharCode(output[i >> 5] >>> i % 32 & 255);
  }
  return result;
}
function rstr2hex(input) {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    const x = input.charCodeAt(i);
    output += hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15);
  }
  return output;
}
function md5(str) {
  const utf8Str = unescape(encodeURIComponent(str));
  return rstr2hex(rstrMD5(utf8Str));
}
var hexTab;
var init_md5 = __esm({
  "src/sync/md5.ts"() {
    hexTab = "0123456789abcdef";
  }
});

// src/sync/flomo-api.ts
var flomo_api_exports = {};
__export(flomo_api_exports, {
  FlomoApiClient: () => FlomoApiClient
});
var import_obsidian3, SIGN_SALT, FlomoApiClient;
var init_flomo_api = __esm({
  "src/sync/flomo-api.ts"() {
    import_obsidian3 = require("obsidian");
    init_md5();
    SIGN_SALT = "dbbc3dd73364b4084c3a69346e0ce2b2";
    FlomoApiClient = class {
      constructor(authToken) {
        this.authToken = authToken;
        this.baseUrl = "https://flomoapp.com/api/v1";
      }
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
      generateSign(params) {
        const sortedKeys = Object.keys(params).sort();
        let str = "";
        for (const key of sortedKeys) {
          const val = params[key];
          if (val !== void 0 && val !== null && val !== "") {
            str += `${key}=${val}&`;
          }
        }
        str = str.substring(0, str.length - 1);
        return md5(str + SIGN_SALT);
      }
      /**
       * Build a signed URL for an API request.
       */
      buildSignedUrl(endpoint, extraParams = {}) {
        const timestamp = Math.floor(Date.now() / 1e3);
        const params = {
          timestamp,
          api_key: "flomo_web",
          app_version: "4.0",
          platform: "web",
          ...extraParams
        };
        const sign = this.generateSign(params);
        params.sign = sign;
        const queryString = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
        return `${this.baseUrl}${endpoint}?${queryString}`;
      }
      /**
       * Make a signed GET request to the flomo API.
       */
      async signedGet(endpoint, extraParams = {}) {
        const url = this.buildSignedUrl(endpoint, extraParams);
        const response = await (0, import_obsidian3.requestUrl)({
          url,
          method: "GET",
          headers: {
            "Authorization": this.authToken
          }
        });
        if (response.status !== 200) {
          throw new Error(`Flomo API error: HTTP ${response.status}`);
        }
        const data = response.json;
        if (typeof data === "string" && data.includes("<!DOCTYPE")) {
          throw new Error("Flomo API returned HTML instead of JSON - token may be invalid");
        }
        if (data.code && data.code !== 0) {
          throw new Error(`Flomo API error: ${data.message || "Unknown error"}`);
        }
        return data;
      }
      /**
       * Fetch memos from flomo using the /memo/updated/ endpoint.
       * @param latestUpdatedAt - Unix timestamp (seconds). Pass "0" for all memos.
       * @param limit - Number of memos per page.
       */
      async fetchMemos(latestUpdatedAt = "0", limit = 200) {
        const data = await this.signedGet("/memo/updated/", {
          limit,
          latest_updated_at: latestUpdatedAt,
          tz: "8:0",
          webp: 1
        });
        const apiMemos = data.data || [];
        const memos = apiMemos.map((m) => this.convertApiMemo(m));
        const hasMore = apiMemos.length >= limit;
        return { memos, hasMore };
      }
      /**
       * Fetch all memos from flomo (paginated via updated_at cursor).
       */
      async fetchAllMemos(onProgress) {
        const allMemos = [];
        let latestUpdatedAt = "0";
        let hasMore = true;
        const limit = 200;
        while (hasMore) {
          const result = await this.fetchMemos(latestUpdatedAt, limit);
          allMemos.push(...result.memos);
          hasMore = result.hasMore;
          if (result.memos.length > 0) {
            const lastMemo = result.memos[result.memos.length - 1];
            latestUpdatedAt = String(Math.floor(lastMemo.updatedAt.getTime() / 1e3));
          }
          if (onProgress) {
            onProgress(allMemos.length);
          }
          if (hasMore) {
            await this.sleep(500);
          }
        }
        return allMemos;
      }
      /**
       * Fetch memos updated after a specific timestamp.
       */
      async fetchNewMemos(afterTimestamp, onProgress) {
        const latestUpdatedAt = String(Math.floor(afterTimestamp / 1e3));
        const result = await this.fetchMemos(latestUpdatedAt, 200);
        if (onProgress) {
          onProgress(result.memos.length);
        }
        return result.memos;
      }
      /**
       * Test the API connection with the current token.
       */
      async testConnection() {
        try {
          await this.signedGet("/user/me");
          return true;
        } catch (e) {
          console.error("Flomo API test connection failed:", e);
          return false;
        }
      }
      /**
       * Convert an API memo to our internal FlomoMemo format.
       */
      convertApiMemo(apiMemo) {
        const plainText = apiMemo.content.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
        const images = (apiMemo.files || []).filter((f) => f.type && f.type.startsWith("image")).map((f) => f.url);
        const tags = (apiMemo.tags || []).map((t) => (typeof t === "string" ? t : t.name).trim());
        return {
          id: `flomo-api-${apiMemo.slug}`,
          content: apiMemo.content,
          plainText,
          tags,
          createdAt: new Date(apiMemo.created_at),
          updatedAt: new Date(apiMemo.updated_at),
          images,
          hasHighlight: apiMemo.content.includes("background-color") || apiMemo.content.includes('class="highlight"')
        };
      }
      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FlomoToObsidianPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  importPath: "flomo",
  mergeByDate: true,
  apiToken: "",
  autoSyncEnabled: false,
  autoSyncInterval: 30,
  downloadImages: false,
  imageFolder: "flomo/attachments",
  syncStartDate: ""
};
var FlomoSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Flomo to Obsidian \u8BBE\u7F6E" });
    new import_obsidian.Setting(containerEl).setName("\u5BFC\u5165\u76EE\u6807\u6587\u4EF6\u5939").setDesc("flomo \u7B14\u8BB0\u5C06\u88AB\u4FDD\u5B58\u5230\u8FD9\u4E2A\u6587\u4EF6\u5939\u4E2D").addText((text) => text.setPlaceholder("flomo").setValue(this.plugin.settings.importPath).onChange(async (value) => {
      this.plugin.settings.importPath = value || "flomo";
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u6309\u65E5\u671F\u5408\u5E76").setDesc("\u5C06\u540C\u4E00\u5929\u7684 memo \u5408\u5E76\u5230\u4E00\u4E2A\u6587\u4EF6\u4E2D\uFF0C\u800C\u4E0D\u662F\u6BCF\u6761 memo \u4E00\u4E2A\u6587\u4EF6").addToggle((toggle) => toggle.setValue(this.plugin.settings.mergeByDate).onChange(async (value) => {
      this.plugin.settings.mergeByDate = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u4E0B\u8F7D\u56FE\u7247").setDesc("\u5C06 memo \u4E2D\u7684\u56FE\u7247\u4E0B\u8F7D\u5230\u672C\u5730 vault").addToggle((toggle) => toggle.setValue(this.plugin.settings.downloadImages).onChange(async (value) => {
      this.plugin.settings.downloadImages = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u56FE\u7247\u6587\u4EF6\u5939").setDesc("\u4E0B\u8F7D\u7684\u56FE\u7247\u4FDD\u5B58\u4F4D\u7F6E").addText((text) => text.setPlaceholder("flomo/attachments").setValue(this.plugin.settings.imageFolder).onChange(async (value) => {
      this.plugin.settings.imageFolder = value || "flomo/attachments";
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h2", { text: "\u{1F504} \u81EA\u52A8\u540C\u6B65" });
    const isLoggedIn = !!this.plugin.settings.apiToken;
    const statusSetting = new import_obsidian.Setting(containerEl).setName("\u767B\u5F55\u72B6\u6001").setDesc(isLoggedIn ? "\u2705 \u5DF2\u767B\u5F55 flomo\uFF0C\u53EF\u4EE5\u81EA\u52A8\u540C\u6B65" : "\u274C \u672A\u767B\u5F55\uFF0C\u8BF7\u5148\u767B\u5F55 flomo \u8D26\u53F7");
    new import_obsidian.Setting(containerEl).setName(isLoggedIn ? "\u91CD\u65B0\u767B\u5F55" : "\u767B\u5F55 flomo").setDesc("\u70B9\u51FB\u6309\u94AE\u6253\u5F00 flomo \u767B\u5F55\u7A97\u53E3\uFF0C\u767B\u5F55\u540E\u81EA\u52A8\u83B7\u53D6\u540C\u6B65\u51ED\u8BC1").addButton((button) => button.setButtonText(isLoggedIn ? "\u{1F504} \u91CD\u65B0\u767B\u5F55" : "\u{1F511} \u767B\u5F55 flomo").setCta().onClick(async () => {
      button.setButtonText("\u23F3 \u767B\u5F55\u4E2D...");
      button.setDisabled(true);
      const success = await this.plugin.loginToFlomo();
      this.display();
    }));
    const manualDetails = containerEl.createEl("details");
    manualDetails.style.marginBottom = "16px";
    manualDetails.style.padding = "8px 12px";
    manualDetails.style.borderRadius = "6px";
    manualDetails.style.background = "var(--background-secondary)";
    const summary = manualDetails.createEl("summary", {
      text: "\u{1F4CB} \u624B\u52A8\u8F93\u5165 Token\uFF08\u81EA\u52A8\u767B\u5F55\u4E0D\u53EF\u7528\u65F6\uFF09"
    });
    summary.style.cursor = "pointer";
    summary.style.fontWeight = "500";
    summary.style.fontSize = "0.9em";
    const steps = manualDetails.createEl("div");
    steps.style.marginTop = "8px";
    steps.style.fontSize = "0.85em";
    steps.style.color = "var(--text-muted)";
    steps.innerHTML = `
            <p><b>\u83B7\u53D6\u6B65\u9AA4\uFF1A</b></p>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00 <a href="https://v.flomoapp.com/login">v.flomoapp.com</a> \u5E76\u767B\u5F55</li>
                <li>\u6309 <b>F12</b> \u6253\u5F00\u5F00\u53D1\u8005\u5DE5\u5177 \u2192 \u5207\u6362\u5230 <b>Network\uFF08\u7F51\u7EDC\uFF09</b>\u9762\u677F</li>
                <li>\u5728 flomo \u4E2D\u968F\u4FBF\u64CD\u4F5C\u4E00\u4E0B\uFF08\u5982\u5237\u65B0\u9875\u9762\uFF09</li>
                <li>\u5728 Network \u5217\u8868\u4E2D\u70B9\u51FB\u4EFB\u610F\u4E00\u4E2A <b>api</b> \u8BF7\u6C42</li>
                <li>\u5728\u53F3\u4FA7 Headers \u4E2D\u627E\u5230 <b>Authorization</b> \u7684\u503C\uFF08\u4EE5 Bearer \u5F00\u5934\uFF09</li>
                <li>\u590D\u5236\u5B8C\u6574\u7684\u503C\u7C98\u8D34\u5230\u4E0B\u65B9\u8F93\u5165\u6846</li>
            </ol>
        `;
    new import_obsidian.Setting(manualDetails).setName("Authorization Token").addText((text) => text.setPlaceholder("Bearer xxx...").setValue(this.plugin.settings.apiToken).onChange(async (value) => {
      this.plugin.settings.apiToken = value;
      await this.plugin.saveSettings();
      this.display();
    }));
    if (isLoggedIn) {
      new import_obsidian.Setting(containerEl).setName("\u7ACB\u5373\u540C\u6B65").setDesc("\u624B\u52A8\u89E6\u53D1\u4E00\u6B21 flomo \u7B14\u8BB0\u540C\u6B65").addButton((button) => button.setButtonText("\u{1F4E5} \u7ACB\u5373\u540C\u6B65").onClick(async () => {
        button.setButtonText("\u23F3 \u540C\u6B65\u4E2D...");
        button.setDisabled(true);
        await this.plugin.syncFromApi();
        button.setButtonText("\u{1F4E5} \u7ACB\u5373\u540C\u6B65");
        button.setDisabled(false);
      }));
      new import_obsidian.Setting(containerEl).setName("\u9000\u51FA\u767B\u5F55").setDesc("\u6E05\u9664\u4FDD\u5B58\u7684\u767B\u5F55\u51ED\u8BC1\u5E76\u505C\u6B62\u81EA\u52A8\u540C\u6B65").addButton((button) => button.setButtonText("\u9000\u51FA\u767B\u5F55").setWarning().onClick(async () => {
        this.plugin.settings.apiToken = "";
        this.plugin.settings.autoSyncEnabled = false;
        this.plugin.stopAutoSync();
        await this.plugin.saveSettings();
        this.display();
      }));
    }
    containerEl.createEl("h3", { text: "\u540C\u6B65\u8BBE\u7F6E" });
    new import_obsidian.Setting(containerEl).setName("\u540C\u6B65\u8D77\u59CB\u65E5\u671F").setDesc("\u53EA\u540C\u6B65\u8BE5\u65E5\u671F\u4E4B\u540E\u7684\u7B14\u8BB0\u3002\u7559\u7A7A\u5219\u540C\u6B65\u5168\u90E8\u7B14\u8BB0\u3002\u4FEE\u6539\u540E\u4F1A\u81EA\u52A8\u91CD\u7F6E\u540C\u6B65\u72B6\u6001").addText((text) => text.setPlaceholder("YYYY-MM-DD\uFF08\u5982 2024-01-01\uFF09").setValue(this.plugin.settings.syncStartDate).onChange(async (value) => {
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return;
      }
      this.plugin.settings.syncStartDate = value;
      await this.plugin.saveSettings();
      await this.plugin.resetSyncState();
    }));
    new import_obsidian.Setting(containerEl).setName("\u91CD\u7F6E\u540C\u6B65\u72B6\u6001").setDesc("\u6E05\u9664\u540C\u6B65\u8BB0\u5F55\uFF0C\u4E0B\u6B21\u540C\u6B65\u5C06\u91CD\u65B0\u62C9\u53D6\u6240\u6709\u7B14\u8BB0\uFF08\u4ECE\u8D77\u59CB\u65E5\u671F\u5F00\u59CB\uFF09").addButton((button) => button.setButtonText("\u{1F504} \u91CD\u7F6E\u540C\u6B65\u72B6\u6001").setWarning().onClick(async () => {
      await this.plugin.resetSyncState();
      new (require("obsidian")).Notice("\u2705 \u540C\u6B65\u72B6\u6001\u5DF2\u91CD\u7F6E\uFF0C\u4E0B\u6B21\u540C\u6B65\u5C06\u91CD\u65B0\u62C9\u53D6\u7B14\u8BB0");
    }));
    new import_obsidian.Setting(containerEl).setName("\u542F\u7528\u81EA\u52A8\u540C\u6B65").setDesc("\u5B9A\u671F\u4ECE flomo \u62C9\u53D6\u65B0\u7B14\u8BB0\uFF08\u9700\u8981\u5148\u767B\u5F55\uFF09").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoSyncEnabled).onChange(async (value) => {
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
    new import_obsidian.Setting(containerEl).setName("\u540C\u6B65\u95F4\u9694\uFF08\u5206\u949F\uFF09").setDesc("\u81EA\u52A8\u540C\u6B65\u7684\u95F4\u9694\u65F6\u95F4").addText((text) => text.setPlaceholder("30").setValue(String(this.plugin.settings.autoSyncInterval)).onChange(async (value) => {
      const num = parseInt(value);
      if (!isNaN(num) && num >= 1) {
        this.plugin.settings.autoSyncInterval = num;
        await this.plugin.saveSettings();
      }
    }));
  }
};

// src/parser/html-parser.ts
var FlomoHtmlParser = class {
  /**
   * Parse a complete flomo HTML export string into structured data.
   */
  parse(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const memoElements = doc.querySelectorAll(".memo");
    const memos = [];
    memoElements.forEach((memoEl, index) => {
      const memo = this.parseMemoElement(memoEl, index);
      if (memo) {
        memos.push(memo);
      }
    });
    return {
      memos,
      totalCount: memos.length,
      source: "html"
    };
  }
  /**
   * Parse a single memo DOM element into a FlomoMemo object.
   */
  parseMemoElement(el, index) {
    var _a, _b;
    const timeEl = el.querySelector(".time");
    const contentEl = el.querySelector(".content");
    if (!contentEl) {
      return null;
    }
    const timeText = ((_a = timeEl == null ? void 0 : timeEl.textContent) == null ? void 0 : _a.trim()) || "";
    const createdAt = this.parseTime(timeText);
    const content = contentEl.innerHTML.trim();
    const plainText = ((_b = contentEl.textContent) == null ? void 0 : _b.trim()) || "";
    const tags = this.extractTags(plainText);
    const images = this.extractImages(contentEl);
    const hasHighlight = contentEl.querySelector(".highlight") !== null || contentEl.innerHTML.includes("background-color");
    const id = this.generateMemoId(timeText, index);
    return {
      id,
      content,
      plainText,
      tags,
      createdAt,
      updatedAt: createdAt,
      images,
      hasHighlight
    };
  }
  /**
   * Parse flomo time format: "2024-01-01 12:00:00" or similar.
   */
  parseTime(timeText) {
    if (!timeText) {
      return new Date();
    }
    const parsed = new Date(timeText.replace(/\//g, "-"));
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  /**
   * Extract tags from memo text. Flomo uses #tag and #tag/subtag format.
   */
  extractTags(text) {
    const tagRegex = /#([\w\u4e00-\u9fa5][\w\u4e00-\u9fa5/]*)/g;
    const tags = [];
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
  extractImages(contentEl) {
    const images = [];
    const imgElements = contentEl.querySelectorAll("img");
    imgElements.forEach((img) => {
      const src = img.getAttribute("src");
      if (src) {
        images.push(src);
      }
    });
    return images;
  }
  /**
   * Generate a deterministic memo ID from timestamp and index.
   */
  generateMemoId(timeText, index) {
    const sanitized = timeText.replace(/[^0-9]/g, "");
    return `flomo-${sanitized}-${index}`;
  }
};

// src/converter/file-writer.ts
var import_obsidian2 = require("obsidian");

// src/converter/markdown-converter.ts
var MarkdownConverter = class {
  /**
   * Convert a single memo to Markdown string with optional frontmatter.
   */
  convertMemo(memo, includeFrontmatter = true) {
    const parts = [];
    if (includeFrontmatter) {
      parts.push(this.generateFrontmatter(memo));
    }
    let markdownContent = this.htmlToMarkdown(memo.content);
    markdownContent = this.convertHighlights(markdownContent);
    parts.push(markdownContent.trim());
    return parts.join("\n\n");
  }
  /**
   * Convert multiple memos into a single Markdown string, grouped under date headers.
   * Used when merging memos by date.
   */
  convertMemosByDate(memos) {
    var _a;
    const parts = [];
    const date = (_a = memos[0]) == null ? void 0 : _a.createdAt;
    if (date) {
      parts.push([
        "---",
        `date: ${this.formatDate(date)}`,
        `source: flomo`,
        `memo_count: ${memos.length}`,
        "---"
      ].join("\n"));
    }
    for (const memo of memos) {
      const time = this.formatTime(memo.createdAt);
      let content = this.htmlToMarkdown(memo.content);
      content = this.convertHighlights(content);
      const tagsStr = memo.tags.map((t) => `#${t.trim()}`).join(" ");
      const section = [
        `## ${time}`,
        "",
        content.trim(),
        "",
        tagsStr ? `${tagsStr}` : "",
        "",
        "---"
      ].filter((line) => line !== void 0).join("\n");
      parts.push(section);
    }
    return parts.join("\n\n");
  }
  /**
   * Generate YAML frontmatter for a memo.
   */
  generateFrontmatter(memo) {
    const lines = [
      "---",
      `created: ${this.formatDateTime(memo.createdAt)}`,
      `updated: ${this.formatDateTime(memo.updatedAt)}`,
      `source: flomo`,
      `flomo_id: "${memo.id}"`
    ];
    if (memo.tags.length > 0) {
      lines.push(`tags:`);
      for (const tag of memo.tags) {
        lines.push(`  - "${tag.replace(/\//g, "/")}"`);
      }
    }
    lines.push("---");
    return lines.join("\n");
  }
  /**
   * Convert HTML content to Markdown.
   * Handles common HTML elements found in flomo exports.
   */
  htmlToMarkdown(html) {
    let md = html;
    md = md.replace(/<a[^>]*class="[^"]*tag[^"]*"[^>]*>.*?<\/a>/gi, "");
    md = md.replace(/<br\s*\/?>/gi, "\n");
    md = md.replace(/<\/p>\s*<p>/gi, "\n\n");
    md = md.replace(/<\/?p>/gi, "\n");
    md = md.replace(/<(?:b|strong)>(.*?)<\/(?:b|strong)>/gi, "**$1**");
    md = md.replace(/<(?:i|em)>(.*?)<\/(?:i|em)>/gi, "*$1*");
    md = md.replace(/<(?:s|del|strike)>(.*?)<\/(?:s|del|strike)>/gi, "~~$1~~");
    md = md.replace(/<li>(.*?)<\/li>/gi, "- $1");
    md = md.replace(/<\/?[uo]l>/gi, "\n");
    let listCounter = 0;
    md = md.replace(/<ol>/gi, () => {
      listCounter = 0;
      return "\n";
    });
    md = md.replace(/<li>(.*?)<\/li>/gi, () => `${++listCounter}. `);
    md = md.replace(/<\/ol>/gi, "\n");
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
    md = md.replace(
      /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi,
      (_, src, alt) => `![${alt || ""}](${src})`
    );
    md = md.replace(/<blockquote>(.*?)<\/blockquote>/gis, (_, content) => {
      return content.split("\n").map((line) => `> ${line}`).join("\n");
    });
    md = md.replace(/<pre><code>(.*?)<\/code><\/pre>/gis, "```\n$1\n```");
    md = md.replace(/<code>(.*?)<\/code>/gi, "`$1`");
    md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1");
    md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1");
    md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1");
    md = md.replace(/<hr\s*\/?>/gi, "\n---\n");
    md = md.replace(/<[^>]+>/g, "");
    md = this.decodeHtmlEntities(md);
    md = md.replace(/\n{3,}/g, "\n\n");
    md = md.trim();
    return md;
  }
  /**
   * Convert flomo highlight marks to Obsidian highlight syntax (==text==).
   */
  convertHighlights(text) {
    text = text.replace(/\[highlight\](.*?)\[\/highlight\]/gi, "==$1==");
    return text;
  }
  /**
   * Decode common HTML entities.
   */
  decodeHtmlEntities(text) {
    const entities = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&nbsp;": " ",
      "&#x2F;": "/",
      "&apos;": "'"
    };
    for (const [entity, char] of Object.entries(entities)) {
      text = text.replace(new RegExp(entity, "g"), char);
    }
    text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
    text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    return text;
  }
  /**
   * Format date as YYYY-MM-DD.
   */
  formatDate(date) {
    return date.toISOString().split("T")[0];
  }
  /**
   * Format time as HH:MM.
   */
  formatTime(date) {
    return date.toTimeString().slice(0, 5);
  }
  /**
   * Format date and time as YYYY-MM-DD HH:MM:SS.
   */
  formatDateTime(date) {
    return `${this.formatDate(date)} ${date.toTimeString().slice(0, 8)}`;
  }
  // === Public accessors for FileWriter ===
  htmlToMarkdownPublic(html) {
    return this.htmlToMarkdown(html);
  }
  convertHighlightsPublic(text) {
    return this.convertHighlights(text);
  }
  formatTimePublic(date) {
    return this.formatTime(date);
  }
};

// src/converter/file-writer.ts
var FileWriter = class {
  constructor(app, importPath, mergeByDate, downloadImages = false, imageFolder = "flomo/attachments") {
    this.app = app;
    this.importPath = importPath;
    this.mergeByDate = mergeByDate;
    this.downloadImages = downloadImages;
    this.imageFolder = imageFolder;
    this.converter = new MarkdownConverter();
  }
  /**
   * Write memos to the vault using upsert logic.
   * Returns the number of written memos.
   */
  async writeMemos(memos, syncState) {
    await this.ensureFolder(this.importPath);
    if (memos.length === 0) {
      return 0;
    }
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
  async writeMemosIndividually(memos, syncState) {
    for (const memo of memos) {
      const fileName = this.generateFileName(memo);
      const filePath = (0, import_obsidian2.normalizePath)(`${this.importPath}/${fileName}`);
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
  async writeMemosMergedByDate(memos, syncState) {
    const dateGroups = /* @__PURE__ */ new Map();
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
      const filePath = (0, import_obsidian2.normalizePath)(`${this.importPath}/${fileName}`);
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      if (existingFile) {
        let existingContent = await this.app.vault.read(existingFile);
        const timeGroups = /* @__PURE__ */ new Map();
        for (const memo of dateMemos) {
          const time = this.converter.formatTimePublic(memo.createdAt);
          if (!timeGroups.has(time)) {
            timeGroups.set(time, []);
          }
          timeGroups.get(time).push(memo);
        }
        for (const [timeKey, memosAtTime] of timeGroups.entries()) {
          const contentParts = [];
          for (const memo of memosAtTime) {
            let content = this.converter.htmlToMarkdownPublic(memo.content);
            content = this.converter.convertHighlightsPublic(content);
            const tagsStr = memo.tags.map((t) => `#${t.trim()}`).join(" ");
            let combinedMemoContent = content.trim();
            if (tagsStr)
              combinedMemoContent += "\n\n" + tagsStr;
            contentParts.push(combinedMemoContent);
            if (!syncState.importedMemoIds.includes(memo.id)) {
              syncState.importedMemoIds.push(memo.id);
              syncState.totalImported++;
            }
          }
          const combinedContent = contentParts.join("\n\n");
          const newSection = [
            `## ${timeKey}`,
            "",
            combinedContent,
            "",
            "---"
          ].join("\n");
          const sectionRegex = new RegExp(`## ${timeKey}\\b[\\s\\S]*?(?:---\\s*|(?=## \\d{2}:\\d{2}))`, "g");
          if (sectionRegex.test(existingContent)) {
            sectionRegex.lastIndex = 0;
            existingContent = existingContent.replace(sectionRegex, newSection + "\n\n");
          } else {
            existingContent = existingContent.trimEnd() + "\n\n" + newSection + "\n\n";
          }
        }
        const totalCount = (existingContent.match(/^## \d{2}:\d{2}/gm) || []).length;
        let updatedContent = existingContent.replace(
          /memo_count: \d+/,
          `memo_count: ${totalCount}`
        );
        await this.app.vault.modify(existingFile, updatedContent);
      } else {
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
  async downloadAndReplaceImages(memo) {
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*\/?>/gi;
    const imageUrls = [];
    let match;
    while ((match = imgRegex.exec(memo.content)) !== null) {
      if (match[1]) {
        imageUrls.push({ url: match[1], fullTag: match[0] });
      }
    }
    if (memo.images) {
      for (const url of memo.images) {
        if (url && !imageUrls.some((item) => item.url === url)) {
          imageUrls.push({ url, fullTag: "" });
        }
      }
    }
    if (imageUrls.length === 0)
      return;
    const localPaths = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const { url: imageUrl, fullTag } = imageUrls[i];
      if (!imageUrl || imageUrl.startsWith("file://") || !imageUrl.startsWith("http"))
        continue;
      try {
        const ext = this.getImageExtension(imageUrl);
        const timestamp = memo.createdAt.getTime();
        const imageName = `flomo-${timestamp}-${i}${ext}`;
        const localPath = (0, import_obsidian2.normalizePath)(`${this.imageFolder}/${imageName}`);
        if (!this.app.vault.getAbstractFileByPath(localPath)) {
          const response = await (0, import_obsidian2.requestUrl)({ url: imageUrl });
          if (response.status === 200) {
            await this.app.vault.createBinary(localPath, response.arrayBuffer);
          }
        }
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
    memo.images = localPaths;
  }
  /**
   * Replace all occurrences of a string (not regex-based, safe for URLs).
   */
  replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
  }
  /**
   * Get file extension from image URL.
   */
  getImageExtension(url) {
    var _a;
    try {
      const pathname = new URL(url).pathname;
      const ext = (_a = pathname.split(".").pop()) == null ? void 0 : _a.toLowerCase();
      if (ext && ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
        return `.${ext}`;
      }
    } catch (e) {
    }
    return ".png";
  }
  /**
   * Generate a file name for an individual memo.
   */
  generateFileName(memo) {
    const date = this.formatDateKey(memo.createdAt);
    const time = memo.createdAt.toTimeString().slice(0, 5).replace(":", "");
    let title = memo.plainText.replace(/#[\w\u4e00-\u9fa5/]+/g, "").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 30).trim();
    if (!title) {
      title = "memo";
    }
    return `flomo-${date}-${time}-${title}.md`;
  }
  /**
   * Upsert a file: create if not exists, update if exists.
   */
  async upsertFile(filePath, content) {
    const existingFile = this.app.vault.getAbstractFileByPath(filePath);
    if (existingFile) {
      await this.app.vault.modify(existingFile, content);
    } else {
      await this.app.vault.create(filePath, content);
    }
  }
  /**
   * Ensure the target folder exists, creating it if necessary.
   */
  async ensureFolder(folderPath) {
    const normalizedPath = (0, import_obsidian2.normalizePath)(folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!folder) {
      const parts = normalizedPath.split("/");
      let currentPath = "";
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const existing = this.app.vault.getAbstractFileByPath(currentPath);
        if (!existing) {
          await this.app.vault.createFolder(currentPath);
        }
      }
    } else if (!(folder instanceof import_obsidian2.TFolder)) {
      throw new Error(`Path "${normalizedPath}" exists but is not a folder.`);
    }
  }
  /**
   * Format date as YYYY-MM-DD for file naming and grouping.
   */
  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
};

// src/sync/sync-engine.ts
var import_obsidian4 = require("obsidian");
init_flomo_api();
var SyncEngine = class {
  constructor(app, getToken, getImportPath, getMergeByDate, getDownloadImages, getImageFolder, getSyncStartDate, getSyncState, saveSyncState) {
    this.app = app;
    this.getToken = getToken;
    this.getImportPath = getImportPath;
    this.getMergeByDate = getMergeByDate;
    this.getDownloadImages = getDownloadImages;
    this.getImageFolder = getImageFolder;
    this.getSyncStartDate = getSyncStartDate;
    this.getSyncState = getSyncState;
    this.saveSyncState = saveSyncState;
    this.syncTimer = null;
    this.isSyncing = false;
  }
  /**
   * Start periodic auto-sync with the given interval.
   */
  startAutoSync(intervalMinutes) {
    this.stopAutoSync();
    const intervalMs = intervalMinutes * 60 * 1e3;
    this.syncTimer = setInterval(() => {
      this.syncNow();
    }, intervalMs);
  }
  /**
   * Stop periodic auto-sync.
   */
  stopAutoSync() {
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
  async syncNow() {
    if (this.isSyncing) {
      new import_obsidian4.Notice("\u23F3 Flomo \u540C\u6B65\u6B63\u5728\u8FDB\u884C\u4E2D...");
      return;
    }
    const token = this.getToken();
    if (!token) {
      new import_obsidian4.Notice("\u274C \u8BF7\u5148\u914D\u7F6E flomo authorization token");
      return;
    }
    this.isSyncing = true;
    const syncState = this.getSyncState();
    try {
      const client = new FlomoApiClient(token);
      const connected = await client.testConnection();
      if (!connected) {
        new import_obsidian4.Notice("\u274C \u65E0\u6CD5\u8FDE\u63A5\u5230 flomo API\uFF0C\u8BF7\u68C0\u67E5 token \u662F\u5426\u6709\u6548");
        return;
      }
      new import_obsidian4.Notice("\u{1F504} \u6B63\u5728\u4ECE flomo \u540C\u6B65\u7B14\u8BB0...");
      let syncFromTimestamp = 0;
      const syncStartDate = this.getSyncStartDate();
      if (syncState.lastSyncTime > 0) {
        syncFromTimestamp = syncState.lastSyncTime;
      } else if (syncStartDate) {
        const startDate = new Date(syncStartDate + "T00:00:00");
        if (!isNaN(startDate.getTime())) {
          syncFromTimestamp = startDate.getTime();
        }
      }
      let memos;
      if (syncFromTimestamp > 0) {
        memos = await client.fetchNewMemos(
          syncFromTimestamp,
          (count) => {
          }
        );
      } else {
        memos = await client.fetchAllMemos(
          (count) => {
          }
        );
      }
      if (syncStartDate && memos.length > 0) {
        const cutoffDate = new Date(syncStartDate + "T00:00:00");
        if (!isNaN(cutoffDate.getTime())) {
          memos = memos.filter((m) => m.createdAt >= cutoffDate);
        }
      }
      if (memos.length === 0) {
        new import_obsidian4.Notice("\u2705 Flomo \u6CA1\u6709\u65B0\u7B14\u8BB0\u9700\u8981\u540C\u6B65");
        return;
      }
      const writer = new FileWriter(
        this.app,
        this.getImportPath(),
        this.getMergeByDate(),
        this.getDownloadImages(),
        this.getImageFolder()
      );
      const written = await writer.writeMemos(memos, syncState);
      syncState.lastSyncTime = Date.now();
      await this.saveSyncState(syncState);
      new import_obsidian4.Notice(`\u2705 \u6210\u529F\u540C\u6B65 ${written} \u6761 flomo \u7B14\u8BB0`);
    } catch (error) {
      console.error("Flomo sync error:", error);
      new import_obsidian4.Notice(`\u274C Flomo \u540C\u6B65\u5931\u8D25: ${error.message}`);
    } finally {
      this.isSyncing = false;
    }
  }
  /**
   * Reset sync state and perform a full re-sync.
   * This clears all tracking data so ALL memos will be re-fetched
   * and re-written (existing files will be updated).
   */
  async fullResync() {
    const syncState = this.getSyncState();
    syncState.lastSyncTime = 0;
    syncState.importedMemoIds = [];
    syncState.totalImported = 0;
    await this.saveSyncState(syncState);
    await this.syncNow();
  }
};

// src/sync/flomo-login.ts
var import_obsidian5 = require("obsidian");
var FlomoLoginModal = class extends import_obsidian5.Modal {
  constructor(app) {
    super(app);
    this.resolvePromise = null;
    this.resolved = false;
    this.pollTimer = null;
  }
  waitForLogin() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.style.width = "460px";
    this.modalEl.style.height = "700px";
    this.modalEl.style.maxWidth = "90vw";
    this.modalEl.style.maxHeight = "90vh";
    contentEl.createEl("h3", { text: "\u{1F511} \u767B\u5F55 flomo" });
    const desc = contentEl.createEl("p", {
      text: "\u8BF7\u5728\u4E0B\u65B9\u767B\u5F55 flomo \u8D26\u53F7\uFF0C\u767B\u5F55\u6210\u529F\u540E\u5C06\u81EA\u52A8\u83B7\u53D6\u540C\u6B65\u51ED\u8BC1\u3002"
    });
    desc.style.fontSize = "0.85em";
    desc.style.color = "var(--text-muted)";
    desc.style.marginBottom = "12px";
    const webviewContainer = contentEl.createEl("div");
    webviewContainer.style.width = "100%";
    webviewContainer.style.height = "550px";
    webviewContainer.style.border = "1px solid var(--background-modifier-border)";
    webviewContainer.style.borderRadius = "8px";
    webviewContainer.style.overflow = "hidden";
    const webview = document.createElement("webview");
    webview.setAttribute("src", "https://v.flomoapp.com/login");
    webview.setAttribute("useragent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    webview.style.width = "100%";
    webview.style.height = "100%";
    webview.style.border = "none";
    webviewContainer.appendChild(webview);
    webview.addEventListener("dom-ready", () => {
      this.startTokenPolling(webview);
    });
    webview.addEventListener("did-navigate", () => {
      this.checkForToken(webview);
    });
    webview.addEventListener("did-navigate-in-page", () => {
      this.checkForToken(webview);
    });
  }
  /**
   * Poll the webview's localStorage for the token every 2 seconds.
   * Flomo stores user info in localStorage under key "me" with an
   * "access_token" field.
   */
  startTokenPolling(webview) {
    setTimeout(() => this.checkForToken(webview), 1e3);
    this.pollTimer = setInterval(() => {
      if (this.resolved) {
        if (this.pollTimer)
          clearInterval(this.pollTimer);
        return;
      }
      this.checkForToken(webview);
    }, 2e3);
  }
  /**
   * Check if token is available in the webview's localStorage.
   */
  async checkForToken(webview) {
    if (this.resolved)
      return;
    try {
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
      if (token && typeof token === "string" && token.length > 20) {
        this.finishLogin(token);
      }
    } catch (e) {
    }
  }
  finishLogin(token) {
    if (this.resolved)
      return;
    this.resolved = true;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.resolvePromise) {
      this.resolvePromise({
        success: true,
        token
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
        token: "",
        error: "\u767B\u5F55\u7A97\u53E3\u5DF2\u5173\u95ED"
      });
    }
    this.contentEl.empty();
  }
};
function openFlomoLogin(app) {
  const modal = new FlomoLoginModal(app);
  return modal.waitForLogin();
}
async function validateToken(token) {
  try {
    const { FlomoApiClient: FlomoApiClient2 } = (init_flomo_api(), __toCommonJS(flomo_api_exports));
    const client = new FlomoApiClient2(token);
    return await client.testConnection();
  } catch (e) {
    return false;
  }
}

// src/main.ts
var DEFAULT_SYNC_STATE = {
  lastSyncTime: 0,
  importedMemoIds: [],
  totalImported: 0
};
var FlomoToObsidianPlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.syncState = { ...DEFAULT_SYNC_STATE };
    this.syncEngine = null;
  }
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("refresh-cw", "Flomo: \u540C\u6B65\u7B14\u8BB0", async () => {
      if (!this.settings.apiToken) {
        await this.loginToFlomo();
      } else {
        await this.syncFromApi();
      }
    });
    this.addCommand({
      id: "login-flomo",
      name: "\u767B\u5F55 flomo \u8D26\u53F7",
      callback: () => this.loginToFlomo()
    });
    this.addCommand({
      id: "import-flomo-html",
      name: "\u5BFC\u5165 flomo HTML \u5BFC\u51FA\u6587\u4EF6",
      callback: () => this.importFromHtml()
    });
    this.addCommand({
      id: "sync-flomo-api",
      name: "\u4ECE flomo API \u540C\u6B65\u7B14\u8BB0",
      callback: () => this.syncFromApi()
    });
    this.addCommand({
      id: "full-resync-flomo",
      name: "\u5B8C\u6574\u91CD\u65B0\u540C\u6B65 flomo \u7B14\u8BB0\uFF08\u6E05\u9664\u540C\u6B65\u72B6\u6001\uFF09",
      callback: () => this.fullResync()
    });
    this.addSettingTab(new FlomoSettingTab(this.app, this));
    this.syncEngine = new SyncEngine(
      this.app,
      () => this.settings.apiToken,
      () => this.settings.importPath,
      () => this.settings.mergeByDate,
      () => this.settings.downloadImages,
      () => this.settings.imageFolder,
      () => this.settings.syncStartDate,
      () => this.syncState,
      async (state) => {
        this.syncState = state;
        await this.saveData({
          settings: this.settings,
          syncState: this.syncState
        });
      }
    );
    if (this.settings.autoSyncEnabled && this.settings.apiToken) {
      const isValid = await validateToken(this.settings.apiToken);
      if (isValid) {
        this.startAutoSync();
      } else {
        new import_obsidian6.Notice("\u26A0\uFE0F Flomo token \u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55");
        this.settings.apiToken = "";
        await this.saveSettings();
      }
    }
    console.log("Flomo to Obsidian plugin loaded");
  }
  onunload() {
    this.stopAutoSync();
    console.log("Flomo to Obsidian plugin unloaded");
  }
  // === Public methods (called from settings tab) ===
  /**
   * Reset sync state so next sync will re-fetch all memos.
   */
  async resetSyncState() {
    this.syncState = {
      lastSyncTime: 0,
      importedMemoIds: [],
      totalImported: 0
    };
    await this.saveData({
      settings: this.settings,
      syncState: this.syncState
    });
  }
  /**
   * Open flomo login window to auto-capture auth token.
   */
  async loginToFlomo() {
    new import_obsidian6.Notice("\u{1F511} \u6B63\u5728\u6253\u5F00 flomo \u767B\u5F55\u7A97\u53E3...");
    try {
      const result = await openFlomoLogin(this.app);
      if (result.success && result.token) {
        this.settings.apiToken = result.token;
        await this.saveSettings();
        new import_obsidian6.Notice("\u2705 flomo \u767B\u5F55\u6210\u529F\uFF01Token \u5DF2\u81EA\u52A8\u4FDD\u5B58");
        if (!this.settings.autoSyncEnabled) {
          this.settings.autoSyncEnabled = true;
          await this.saveSettings();
        }
        this.startAutoSync();
        return true;
      } else {
        new import_obsidian6.Notice(`\u274C \u767B\u5F55\u5931\u8D25: ${result.error || "\u672A\u77E5\u9519\u8BEF"}`);
        return false;
      }
    } catch (error) {
      console.error("Flomo login error:", error);
      new import_obsidian6.Notice(`\u274C \u767B\u5F55\u5931\u8D25: ${error.message}`);
      return false;
    }
  }
  startAutoSync() {
    if (this.syncEngine) {
      this.syncEngine.startAutoSync(this.settings.autoSyncInterval);
      new import_obsidian6.Notice(`\u{1F504} Flomo \u81EA\u52A8\u540C\u6B65\u5DF2\u542F\u52A8\uFF08\u6BCF ${this.settings.autoSyncInterval} \u5206\u949F\uFF09`);
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
      syncState: this.syncState
    });
  }
  // === Private methods ===
  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data == null ? void 0 : data.settings);
    this.syncState = Object.assign({}, DEFAULT_SYNC_STATE, data == null ? void 0 : data.syncState);
  }
  /**
   * Import memos from a flomo HTML export file.
   * Opens a file picker dialog for the user to select the HTML file.
   */
  async importFromHtml() {
    try {
      const electron = require("electron");
      const result = await electron.remote.dialog.showOpenDialog({
        title: "\u9009\u62E9 flomo \u5BFC\u51FA\u7684 HTML \u6587\u4EF6",
        filters: [
          { name: "HTML \u6587\u4EF6", extensions: ["html", "htm"] },
          { name: "\u6240\u6709\u6587\u4EF6", extensions: ["*"] }
        ],
        properties: ["openFile"]
      });
      if (result.canceled || result.filePaths.length === 0) {
        return;
      }
      const filePath = result.filePaths[0];
      new import_obsidian6.Notice("\u{1F4D6} \u6B63\u5728\u8BFB\u53D6 flomo \u5BFC\u51FA\u6587\u4EF6...");
      const fs = require("fs");
      const html = fs.readFileSync(filePath, "utf-8");
      const parser = new FlomoHtmlParser();
      const exportData = parser.parse(html);
      if (exportData.memos.length === 0) {
        new import_obsidian6.Notice("\u26A0\uFE0F \u672A\u5728 HTML \u6587\u4EF6\u4E2D\u627E\u5230\u4EFB\u4F55 memo");
        return;
      }
      new import_obsidian6.Notice(`\u{1F4DD} \u627E\u5230 ${exportData.totalCount} \u6761 memo\uFF0C\u6B63\u5728\u5BFC\u5165...`);
      const writer = new FileWriter(
        this.app,
        this.settings.importPath,
        this.settings.mergeByDate
      );
      const written = await writer.writeMemos(exportData.memos, this.syncState);
      await this.saveSettings();
      if (written > 0) {
        new import_obsidian6.Notice(`\u2705 \u6210\u529F\u5BFC\u5165 ${written} \u6761\u65B0 memo\uFF08\u5171 ${this.syncState.totalImported} \u6761\u5DF2\u5BFC\u5165\uFF09`);
      } else {
        new import_obsidian6.Notice("\u2139\uFE0F \u6240\u6709 memo \u5DF2\u7ECF\u5BFC\u5165\u8FC7\u4E86\uFF0C\u6CA1\u6709\u65B0\u5185\u5BB9");
      }
    } catch (error) {
      console.error("Failed to import flomo HTML:", error);
      new import_obsidian6.Notice(`\u274C \u5BFC\u5165\u5931\u8D25: ${error.message}`);
    }
  }
  /**
   * Sync memos from flomo API.
   * If no token is set, prompt login first.
   */
  async syncFromApi() {
    if (!this.syncEngine)
      return;
    if (!this.settings.apiToken) {
      const loggedIn = await this.loginToFlomo();
      if (!loggedIn)
        return;
    }
    await this.syncEngine.syncNow();
  }
  /**
   * Full re-sync: clear state and re-fetch everything from API.
   */
  async fullResync() {
    if (!this.syncEngine)
      return;
    if (!this.settings.apiToken) {
      const loggedIn = await this.loginToFlomo();
      if (!loggedIn)
        return;
    }
    await this.syncEngine.fullResync();
  }
};
