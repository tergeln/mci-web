import { pageSeo, publicPages, site, siteStructuredData } from '../src/data/seo.js';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function seoHead(pathname) {
  const page = pageSeo(pathname);
  const meta = (attribute, key, value) => `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  return [
    `<title>${escapeHtml(page.title)}</title>`,
    meta('name', 'description', page.description),
    meta('name', 'robots', page.noindex ? 'noindex,follow' : 'index,follow'),
    `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`,
    meta('property', 'og:type', 'website'), meta('property', 'og:site_name', site.name),
    meta('property', 'og:title', page.title), meta('property', 'og:description', page.description),
    meta('property', 'og:url', page.canonical), meta('property', 'og:image', page.image),
    meta('name', 'twitter:card', 'summary'), meta('name', 'twitter:title', page.title),
    meta('name', 'twitter:description', page.description), meta('name', 'twitter:image', page.image),
    `<script type="application/ld+json">${JSON.stringify(siteStructuredData).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
}

export function withSeo(html, path) {
  return html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, `<!-- SEO:START -->\n    ${seoHead(path)}\n    <!-- SEO:END -->`);
}

export function seoPlugin() {
  return {
    name: 'mci-page-seo',
    enforce: 'post',
    transformIndexHtml(html, context) { return withSeo(html, (context.path || '/').split('?')[0]); },
    generateBundle(_options, bundle) {
      const template = bundle['index.html'];
      if (!template) throw new Error('SEO build requires index.html');
      for (const path of [...publicPages.filter((item) => item.path !== '/').map((item) => item.path), '/login', '/register', '/account']) {
        this.emitFile({ type: 'asset', fileName: `${path.slice(1)}/index.html`, source: withSeo(String(template.source), path) });
      }
    },
  };
}
