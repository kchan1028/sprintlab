// Checks every relative link and heading anchor in the repository's tracked Markdown files.
// Run with `npm run check:docs`; CI runs it on every pull request, including documentation-only ones.
// External links (http, mailto, tel) are not checked. Exits 1 and lists each broken link.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const files = execFileSync('git', ['ls-files', '*.md'], { encoding: 'utf8' }).split('\n').filter(Boolean);

/** Code blocks and inline code can hold link-like text that is not a link. */
const withoutCode = (text) => text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

/** GitHub's heading anchor: lower case, links reduced to their text, punctuation dropped (underscores and hyphens kept), spaces to hyphens. */
function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*~]/g, '')
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .replace(/ /g, '-');
}

const anchorCache = new Map();
function anchorsOf(path) {
  if (!anchorCache.has(path)) {
    const anchors = new Set();
    const seen = new Map();
    const text = readFileSync(path, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, heading] of text.matchAll(/^#{1,6}\s+(.*?)\s*#*\s*$/gm)) {
      const s = slug(heading);
      const n = seen.get(s) ?? 0;
      seen.set(s, n + 1);
      anchors.add(n === 0 ? s : `${s}-${n}`);
    }
    for (const [, id] of text.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) anchors.add(id);
    anchorCache.set(path, anchors);
  }
  return anchorCache.get(path);
}

const problems = [];
for (const file of files) {
  const text = withoutCode(readFileSync(file, 'utf8'));
  const targets = [...text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g), ...text.matchAll(/^\[[^\]]+\]:\s*(\S+)/gm)].map((m) => m[1]);
  for (const link of targets) {
    if (/^(https?:|mailto:|tel:)/.test(link)) continue;
    const hash = link.indexOf('#');
    const path = hash === -1 ? link : link.slice(0, hash);
    const fragment = hash === -1 ? '' : link.slice(hash + 1);
    const target = path ? normalize(join(dirname(file), decodeURI(path))) : file;
    if (!existsSync(target)) {
      problems.push(`${file}: ${link} (file not found)`);
      continue;
    }
    if (fragment && target.endsWith('.md') && statSync(target).isFile() && !anchorsOf(target).has(fragment)) {
      problems.push(`${file}: ${link} (heading not found)`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Broken documentation links (${problems.length}):\n${problems.map((p) => `  ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`Documentation links OK: ${files.length} Markdown files checked.`);
