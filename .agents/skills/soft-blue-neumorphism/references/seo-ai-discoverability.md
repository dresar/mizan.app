# SEO, Search Indexing, and AI Discoverability

This guide applies to public websites and public pages inside hybrid apps. It does not make private application screens searchable. Follow current search-engine documentation when platform rules change.

## 1. Core rule: build for people, then make the content discoverable

Search engines and AI search experiences need accessible, crawlable, useful page content. Technical SEO helps a platform discover and understand a page; it does not guarantee indexing, ranking, a rich result, an AI Overview citation, or any particular placement.

Google's current guidance says its AI Search features use the same foundational SEO and Search eligibility requirements. There is no special AI schema or required AI text file for Google AI Overviews or AI Mode. Prioritize useful original content, technical crawlability, clear site structure, accessible text, good page experience, and accurate structured data. Do not build an SEO strategy around hacks such as keyword stuffing, hidden text, unnecessary content chunking, or an `llms.txt` file as a claimed Google ranking factor.

## 2. Route classification before implementation

Classify every route into one of these groups:

| Route type | Index policy | Rendering and content |
|---|---|---|
| Public marketing, product, category, article, documentation, location page | Usually indexable | SSR, SSG, or suitable hybrid rendering; complete useful content in rendered HTML |
| Public listing/search result | Decide by unique value and duplication | Index only pages with useful, distinct content; control parameter variants and filters |
| Login, account, admin, private dashboard, private files | Noindex and access-controlled | Require authentication and authorization; never expose private data to crawlers |
| Internal API, webhook, health check, preview, staging | Not a public search page | Restrict access as appropriate; do not add to sitemap |
| App-only screen or native route | Not directly indexed as a web page | Provide a public web landing/deep-link page only when discovery is a product requirement |

Never treat `robots.txt` as security. A disallowed URL can still be known to a crawler. Protect private data at the server/API layer and apply `noindex` to pages that must not appear in results while ensuring crawlers can fetch the directive when required.

## 3. Per-page metadata contract

Each indexable URL must have:

- A unique, descriptive `<title>` that names the actual page and its subject.
- A concise, original meta description that accurately previews the page. Do not repeat one generic description across the whole site.
- One clear main heading (`h1`) and a logical, non-skipping heading hierarchy where possible.
- A self-referencing canonical URL, or a deliberately selected canonical when duplicate URLs exist.
- Correct document language, such as `<html lang="id">` for Indonesian content.
- Useful Open Graph and social preview metadata when sharing is relevant. These tags complement SEO; they do not replace core metadata.
- A meaningful favicon and suitable social preview image when available.
- Descriptive internal link text and meaningful image `alt` text. Use empty alt text (`alt=""`) for purely decorative images.

Metadata must be rendered for the actual route, not only changed after the user clicks around. Never use keyword lists or meta keywords as a ranking workaround.

## 4. HTML rendering and JavaScript

- Prefer server-side rendering, static generation, or hybrid rendering for public content when the chosen framework supports it.
- Deliver the main page title, primary text, canonical link, and important links in the initial HTML response whenever practical.
- Do not hide essential page content behind login, a click, a tab switch, an infinite scroll trigger, or an interaction that crawlers cannot reasonably perform.
- Use progressive enhancement. Navigation and core content should remain understandable even when nonessential JavaScript fails.
- For client-rendered applications, implement framework-specific metadata and rendering correctly. Verify the rendered page with URL inspection or a rendered HTML test; do not assume that a client-side app is automatically invisible or automatically SEO-safe.
- Give important public pages stable, direct URLs. Refreshing a route and opening it in a new tab must work.
- Use crawlable `<a href="...">` links for page navigation. Use buttons for actions, not as substitutes for links.
- Avoid endless client-only pagination. Provide crawlable page URLs or a server-rendered route strategy when paginated content should be discovered.

## 5. URL and canonical hygiene

- Use lowercase, readable, stable URLs with meaningful words and hyphens where appropriate.
- Redirect obsolete URLs to the closest relevant replacement with a permanent redirect when the move is permanent.
- Choose one canonical host, protocol, slash convention, and URL format.
- Keep tracking parameters, sorting parameters, and filter parameters from creating large sets of duplicate indexable pages.
- Do not canonicalize unrelated pages to the home page.
- Return correct HTTP statuses: `200` for valid pages, `301`/`308` for permanent redirects, `404` or `410` for genuinely removed content when appropriate, and `5xx` only for server failures.
- Keep canonical metadata consistent with sitemap URLs and internal links.

## 6. Robots and sitemap

### `robots.txt`

- Place it at the domain root, for example `https://example.com/robots.txt`.
- Allow crawlers to fetch public content and resources needed to render it.
- Do not accidentally block important CSS, JavaScript, images, or public routes.
- Add the absolute sitemap URL.
- Do not put confidential paths in the file as a substitute for authentication.

Example starter:

```text
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

Adapt the policy for the real site. Do not copy this blindly into apps with private routes or special crawler requirements.

### XML sitemap

- Include only canonical, public, indexable URLs that return a successful response.
- Exclude redirects, errors, `noindex` pages, private pages, staging routes, and duplicate parameter variants.
- Use absolute URLs and an accurate `lastmod` value when the content meaningfully changes.
- Generate it from the real route/content source so new and removed pages stay synchronized.
- Split very large sitemaps and use a sitemap index when required by the protocol limits.
- Keep the sitemap reachable and reference it from `robots.txt`.
- Submit it in Google Search Console and other relevant webmaster tools. Submission is a discovery hint, not a guarantee of indexing.

## 7. Structured data

Use JSON-LD when a relevant supported type describes the actual page. Select types by content, not by the rich result you hope to receive.

Potentially relevant types include `Organization`, `WebSite`, `BreadcrumbList`, `Article` or `BlogPosting`, `Product`, `LocalBusiness`, `Event`, `Course`, and other types only when the page genuinely contains that entity and the search platform supports the corresponding feature.

Rules:

- Structured data must match content visible to users on that URL.
- Never invent a review, rating, price, availability, author, date, address, or credential.
- Use complete required and recommended properties from the current platform documentation.
- Validate JSON syntax and test the page with Google's Rich Results Test when the type is eligible, plus Schema.org Validator for vocabulary-level validation.
- Keep entity identifiers and organization/business facts consistent across pages.
- Do not add FAQ, HowTo, or other markup merely because a schema type exists; rich-result eligibility and display are controlled by search platforms and can change.
- Do not expect structured data alone to improve ranking or force a rich result.

Example generic organization markup. Replace every sample value with verified business information and include it only when appropriate:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Organization",
  "url": "https://example.com",
  "logo": "https://example.com/assets/logo.png"
}
</script>
```

## 8. Content that AI systems can understand and cite

There is no universal switch that makes a website readable or cited by every AI system. Improve the likelihood that systems can understand the site by applying these practices:

- Publish useful, original information that answers real questions and provides detail beyond generic summaries.
- State important facts directly in visible text. Do not put essential meaning only inside an image, canvas, video, icon, or client-only interaction.
- Give each page one clear subject, an informative title, a concise introduction, meaningful section headings, and descriptive links.
- Identify the author or responsible organization when appropriate. Add genuine publication and modification dates for editorial content, not fabricated freshness signals.
- Separate facts, instructions, opinion, and promotional claims clearly.
- Cite primary sources for factual claims in editorial content and maintain update ownership for information that can become stale.
- Use tables and lists when they improve comprehension, but do not create arbitrary fragments solely for supposed AI chunking benefits.
- Include original product details, specifications, policies, methodology, examples, images, and local context where those are genuinely useful.
- Make contact, company, policy, and author information discoverable when relevant to trust.
- Keep important facts consistent across page text, metadata, JSON-LD, feeds, and public business profiles.
- Do not create fake author personas, fake reviews, mass-generated doorway pages, hidden prompt text, or content intended to manipulate an AI answer.

Optional ecosystem files such as `llms.txt` may be added only when explicitly requested or when a specific consuming platform documents support for them. They are not a replacement for crawlable HTML, sitemaps, or high-quality content and are not required for Google AI Search inclusion.

## 9. Backend-driven public content

When public pages get content from an API or database:

- Render the page-specific title, description, canonical URL, main text, structured data, and important links from the same trusted content record.
- Fetch public data on the server when the framework supports it and when doing so does not expose secrets.
- Return a meaningful `404` for missing public content instead of a blank shell with a `200` status.
- Keep public data and private data on separate authorization paths. Never serialize private fields into page HTML, hydration payloads, JSON-LD, or public APIs.
- Keep metadata synchronized when content changes. Use cache revalidation or invalidation rules that match the product's update needs.
- For API errors, show a clear user-facing error; do not render fabricated data to satisfy crawlers.
- Generate sitemap entries from publishable records only, and remove unpublished/deleted records correctly.

## 10. Performance and page experience

Treat performance as both a user-experience and discovery quality concern:

- Measure Core Web Vitals using field data and lab tools. Current good thresholds at the 75th percentile are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1.
- Optimize the largest contentful image/text, fonts, JavaScript, server response, and layout stability.
- Set intrinsic image dimensions or aspect ratios to reserve space. Use responsive formats and sizes.
- Lazy-load below-the-fold images and defer noncritical scripts. Do not lazy-load the primary above-the-fold hero/LCP image by default.
- Avoid large blur effects, excessive shadows, continuous animation, and oversized animation bundles on low-end devices.
- Keep interaction latency low and avoid long main-thread tasks.
- Test on realistic mobile connections and low-to-mid range devices, not only a developer workstation.

## 11. Search engine setup and validation

For a launched public website, document these owner actions:

1. Confirm the final production domain and HTTPS.
2. Verify domain/property ownership in Google Search Console.
3. Publish and inspect `robots.txt` and the XML sitemap.
4. Submit the sitemap in Search Console.
5. Inspect the home page and representative public URLs with URL Inspection; request indexing for important new pages when appropriate.
6. Check Page Indexing, crawl errors, manual actions, security issues, Core Web Vitals, and search performance regularly.
7. Test structured data with the relevant validators.
8. Optionally configure Bing Webmaster Tools and IndexNow when the site/update workflow benefits from it.
9. Re-test after routing, rendering, canonical, robots, or deployment changes.

Do not state “already indexed” unless it was actually confirmed in the relevant search platform. A generated sitemap, a successful HTTP response, or an indexing request is not proof of index inclusion.

## 12. SEO acceptance checklist

- [ ] Every public route has unique and accurate title and description metadata.
- [ ] Canonical URLs are correct and consistent with internal links and sitemap entries.
- [ ] Main content is useful, visible, and available in rendered text.
- [ ] Important navigation paths use crawlable links with descriptive text.
- [ ] Heading hierarchy and document language are appropriate.
- [ ] Images have accurate alt text or empty alt for decoration.
- [ ] `robots.txt` does not block important public content or rendering resources.
- [ ] Sitemap contains only canonical, indexable, successful public URLs.
- [ ] Structured data is relevant, factual, visible-content-aligned, and validated.
- [ ] Private pages and APIs are access-controlled and non-indexable.
- [ ] No duplicate, thin, doorway, hidden, or keyword-stuffed pages were introduced.
- [ ] Search Console verification/submission/inspection steps are documented.
- [ ] Performance and Core Web Vitals have been measured or a measurement plan is stated.
- [ ] No promise of ranking, indexing, rich results, or AI citation is made.

## Official references

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google guide to generative AI features in Search: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search developer guide: https://developers.google.com/search/docs/fundamentals/get-started-developers
- Robots.txt introduction: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Sitemap overview: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Structured data introduction: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Core Web Vitals: https://web.dev/articles/vitals
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a

Reference review date: 2026-11-04. Always check current platform documentation before relying on a feature-specific eligibility rule.
