const dateMemos = [
    { id: 1, time: "09:12", content: "888", tags: [] },
    { id: 2, time: "09:12", content: "888", tags: [] },
    { id: 3, time: "09:13", content: "8786\n\n555", tags: [] }
];

// Instead of looping individual memos and replacing, let's group by time first
const timeGroups = new Map();
for (const memo of dateMemos) {
    if (!timeGroups.has(memo.time)) {
        timeGroups.set(memo.time, []);
    }
    timeGroups.get(memo.time).push(memo);
}

let existingContent = `---
date: 2026-03-03
source: flomo
memo_count: 5
---

## 09:12
old content
---
`;

for (const [timeKey, memos] of timeGroups.entries()) {
    // Build a single section for all memos sharing this minute
    const contentParts = [];
    for (const memo of memos) {
        let content = memo.content.trim();
        const tagsStr = memo.tags.map(t => `#${t.trim()}`).join(' ');
        if (tagsStr) content += '\n\n' + tagsStr;
        contentParts.push(content);
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

    const sectionRegex = new RegExp(`## ${timeKey}\\b[\\s\\S]*?(?:---\\s*|(?=## \\d{2}:\\d{2}))`, 'g');

    if (sectionRegex.test(existingContent)) {
        sectionRegex.lastIndex = 0;
        existingContent = existingContent.replace(sectionRegex, newSection + '\n\n');
    } else {
        existingContent = existingContent.trimEnd() + '\n\n' + newSection + '\n\n';
    }
}

console.log(existingContent);
