import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageSeo, publicPages, siteStructuredData } from './seo.js';
import { withSeo } from '../../scripts/seo.mjs';

test('public pages have distinct canonical URLs and are all present in sitemap', () => {
  const sitemap = readFileSync(new URL('../../public/sitemap.xml', import.meta.url), 'utf8');
  const urls = publicPages.map(({ path }) => pageSeo(path).canonical);
  assert.equal(urls.length, new Set(urls).size);
  for (const { path } of publicPages) {
    const page = pageSeo(path);
    assert.equal(page.noindex, false);
    assert.ok(sitemap.includes(`<loc>${page.canonical}</loc>`));
  }
  assert.equal(pageSeo('/courses/').canonical, pageSeo('/courses').canonical);
  assert.deepEqual(pageSeo('/index.html'), pageSeo('/'));
  assert.deepEqual(pageSeo('/courses/index.html'), pageSeo('/courses'));
  assert.equal(pageSeo('/account').noindex, true);
  assert.equal(pageSeo('/login').noindex, true);
  assert.equal(pageSeo('/register').noindex, true);
  assert.equal(pageSeo('/news/missing').noindex, true);
});

test('route HTML replaces old metadata instead of duplicating it', () => {
  const template = '<head><!-- SEO:START --><title>old</title><!-- SEO:END --></head>';
  const html = withSeo(withSeo(template, '/'), '/courses');
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(html.includes('https://www.mci.mn/courses'));
  assert.ok(!html.includes('<title>old</title>'));
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  assert.deepEqual(JSON.parse(json), siteStructuredData);
  assert.ok(withSeo(template, '/account').includes('content="noindex,follow"'));
});
