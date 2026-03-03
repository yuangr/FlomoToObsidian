const content = `---
date: 2026-03-03
source: flomo
memo_count: 5
---

## 09:12
888
---
`;

const time = "09:12";
const newSection = `## 09:12\n888\n---`;

const sectionRegex = new RegExp(`## ${time}\\b[\\s\\S]*?(?:---\\s*|(?=## \\d{2}:\\d{2}))`, 'g');

console.log("TEST:", sectionRegex.test(content));
sectionRegex.lastIndex = 0;
const updated = content.replace(sectionRegex, newSection + '\n\n');

console.log("RESULT:");
console.log(updated);
