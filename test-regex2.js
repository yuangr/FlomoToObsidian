const content = `---
date: 2026-03-03
source: flomo
memo_count: 5
---

## 09:12
888
---
`;

let existingContent = content;
const dateMemos = [
    { time: "09:12", content: "888" },
    { time: "09:12", content: "888" }
];

for (const memo of dateMemos) {
    const time = memo.time;
    const newSection = `## ${time}\n${memo.content}\n---`;

    const sectionRegex = new RegExp(`## ${time}\\b[\\s\\S]*?(?:---\\s*|(?=## \\d{2}:\\d{2}))`, 'g');

    if (sectionRegex.test(existingContent)) {
        sectionRegex.lastIndex = 0;
        existingContent = existingContent.replace(sectionRegex, newSection + '\n\n');
    } else {
        existingContent = existingContent.trimEnd() + '\n\n' + newSection + '\n\n';
    }
}

console.log("RESULT:");
console.log(existingContent);
