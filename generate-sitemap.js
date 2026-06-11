#!/usr/bin/env node
/**
 * generate-sitemap.js
 * -------------------
 * Reads articles.json and writes sitemap.xml to the same directory.
 * Run after adding or removing articles:
 *
 *   node generate-sitemap.js
 *
 * Optional: pass a custom base URL as first argument:
 *   node generate-sitemap.js https://mi-otro-dominio.es
 */

const fs   = require('fs');
const path = require('path');

const BASE_URL   = process.argv[2] || 'https://nomosypraxis.es';
const ARTICLES   = path.join(__dirname, 'articles.json');
const OUTPUT     = path.join(__dirname, 'sitemap.xml');

// Spanish month names → zero-padded number
const MONTHS = {
  enero:'01', febrero:'02', marzo:'03',    abril:'04',
  mayo:'05',  junio:'06',  julio:'07',    agosto:'08',
  septiembre:'09', octubre:'10', noviembre:'11', diciembre:'12'
};

function toISO(str) {
  const m = (str || '').match(/(\d+)\s+de\s+(\w+),?\s+(\d{4})/i);
  if (!m) return new Date().toISOString().slice(0, 10);
  const day   = String(m[1]).padStart(2, '0');
  const month = MONTHS[m[2].toLowerCase()] || '01';
  return `${m[3]}-${month}-${day}`;
}

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Static pages ────────────────────────────────────────────
const staticPages = [
  { loc: BASE_URL + '/',        priority: '1.0', changefreq: 'weekly'  },
  { loc: BASE_URL + '/about',   priority: '0.5', changefreq: 'monthly' },
  { loc: BASE_URL + '/contact', priority: '0.5', changefreq: 'monthly' },
];

// ── Article pages ───────────────────────────────────────────
const raw      = fs.readFileSync(ARTICLES, 'utf8');
const articles = JSON.parse(raw);

const articleUrls = Object.entries(articles).map(([id, art]) => ({
  loc:        `${BASE_URL}/articles?id=${escape(id)}`,
  lastmod:    toISO(art.date),
  priority:   '0.8',
  changefreq: 'monthly',
}));

// ── Build XML ───────────────────────────────────────────────
const all = [...staticPages, ...articleUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT, xml, 'utf8');
console.log(`✓ sitemap.xml written — ${all.length} URLs (${articleUrls.length} articles)`);
