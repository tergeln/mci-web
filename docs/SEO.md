# Google Search setup

Production canonical origin: https://www.mci.mn (mci.mn redirects here).

## Implemented in this repository

- Public URL inventory and descriptions: `src/data/seo.js`.
- Homepage brand aliases: Magic Code AI, Magic Code, MCI (Organization and WebSite JSON-LD).
- Build-time route HTML metadata: `scripts/seo.mjs`, invoked by Vite.
- Runtime title, description, canonical and social metadata: `useDocumentTitle`.
- Sitemap: `/sitemap.xml`; crawler instructions: `/robots.txt`.
- Public routes: `/`, `/courses`, `/news`, `/news/1`, `/news/2`, `/news/3`.
- Account, registration, login and unknown routes have `noindex` metadata.
- Vercel serves generated route HTML through `vercel.json`.

Route HTML contains metadata immediately; the page body is still rendered by React.
When adding or removing published news, update `publicPages`, `public/sitemap.xml`
and the corresponding Vercel rewrite together. Never list private account URLs.

## After publishing these changes

1. The URL-prefix property `https://www.mci.mn/` was added to the owner's signed-in Search Console account.
2. Google supplied `google33305604d58274e5.html`; its original downloaded contents are saved in `public/`. Keep this file after verification.
3. Publish the repository changes. Confirm that `https://www.mci.mn/google33305604d58274e5.html` serves the verification text directly (not the app HTML).
4. Return to the property's **Verify ownership** dialog and click **VERIFY** under **HTML file**.
5. Under **Sitemaps**, submit `https://www.mci.mn/sitemap.xml`.
6. Inspect `https://www.mci.mn/` in **URL Inspection**, run **Test live URL**, then **Request indexing** if eligible.
7. Check **Page indexing** and **Performance** for indexing issues and brand queries.

The URL-prefix property covers the canonical www HTTPS site. A Domain property
for `mci.mn` can additionally cover all hostnames/protocols, but requires a Google-provided DNS TXT record.

Search Console verification requires the owner's Google account. DNS access is needed only for the optional Domain property.
No verification token is invented or included here. Indexing and ranking are decided by Google;
submitting a sitemap or request does not guarantee a position or an exact timeline.
