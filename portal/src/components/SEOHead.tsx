/**
 * SEOHead — Reusable SEO component using react-helmet-async
 * 
 * Injects dynamic <title>, <meta>, <link>, Open Graph, Twitter Card,
 * and JSON-LD structured data into <head> on every route change.
 */

import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Pondok Pesantren Modern Raudhatussalam Mahato';
const SITE_URL  = 'https://rdsmahato.ponpes.id';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION =
  'Pondok Pesantren Modern Raudhatussalam Mahato — Lembaga pendidikan Islam berbasis KMI Gontor di Rokan Hulu, Riau. MTs, MA, Tahfidz Al-Qur\'an. Mendidik generasi berilmu, berkarakter, dan berakhlak mulia.';
const DEFAULT_KEYWORDS =
  'pondok pesantren raudhatussalam, pesantren mahato, pesantren riau, pesantren gontor riau, mts mahato, ma mahato, sekolah islam rokan hulu, boarding school islam riau, tahfidz quran riau, pesantren modern riau, pendidikan islam rokan hulu';

interface SEOHeadProps {
  /** Page title — will be appended with " | Raudhatussalam Mahato" */
  title?: string;
  /** Short page description for meta description & OG */
  description?: string;
  /** Comma-separated keywords */
  keywords?: string;
  /** Canonical URL path (e.g. "/sejarah") — site URL is prepended */
  path?: string;
  /** Open Graph / Twitter card image absolute URL */
  image?: string;
  /** 'website' | 'article' | 'profile' */
  ogType?: 'website' | 'article' | 'profile';
  /** Article publish date (ISO string) */
  publishedAt?: string;
  /** Article modified date (ISO string) */
  modifiedAt?: string;
  /** JSON-LD structured data object */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Prevent indexing (admin pages etc.) */
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = '',
  image = DEFAULT_IMAGE,
  ogType = 'website',
  publishedAt,
  modifiedAt,
  jsonLd,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Pesantren Modern Berbasis KMI Gontor di Riau`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  // Default JSON-LD — EducationalOrganization
  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    alternateName: 'Raudhatussalam Mahato',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: DEFAULT_IMAGE,
    description: DEFAULT_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Desa Mahato, Kecamatan Tambusai Utara',
      addressLocality: 'Rokan Hulu',
      addressRegion: 'Riau',
      postalCode: '28558',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '1.3400',
      longitude: '100.2800',
    },
    telephone: '+62-812-3456-7890',
    email: 'info@raudhatussalam.id',
    foundingDate: '2008',
    hasMap: 'https://maps.google.com/?q=Raudhatussalam+Mahato',
    sameAs: [
      'https://rdsmahato.ponpes.id',
      'https://raudhatussalaampt.com',
    ],
  };

  const structuredData = jsonLd || defaultJsonLd;
  const jsonLdArray = Array.isArray(structuredData)
    ? structuredData
    : [structuredData];

  return (
    <Helmet>
      {/* ── Primary ── */}
      <html lang="id" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="id_ID" />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />

      {/* ── JSON-LD Structured Data ── */}
      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// Re-export constants for use in other files
export { SITE_NAME, SITE_URL, DEFAULT_IMAGE, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS };
