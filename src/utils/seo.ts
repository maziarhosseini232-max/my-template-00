export interface MetaTagsConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.other';
  canonical?: string;
  structuredData?: Record<string, any>;
}

const DEFAULT_TITLE = 'لومینا لرن — پلتفرم جامع دوره‌های آموزشی آنلاین';
const DEFAULT_DESCRIPTION = 'پلتفرم تخصصی آموزش آنلاین و مسترکلاس‌های ویدیویی به زبان فارسی با رابط کاربری راست‌چین (RTL)، اساتید برجسته، سیستم آزمون و اعطای گواهی معتبر.';

export function updateMetaTags(config: MetaTagsConfig) {
  // 1. Update Title
  if (config.title) {
    document.title = config.title;
  }

  // Helper to set or create meta tag
  const setMeta = (attribute: 'name' | 'property', name: string, content?: string) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // 2. Standard Meta Tags
  if (config.description) setMeta('name', 'description', config.description);
  if (config.keywords) setMeta('name', 'keywords', config.keywords);

  // 3. OpenGraph Tags
  if (config.title) setMeta('property', 'og:title', config.title);
  if (config.description) setMeta('property', 'og:description', config.description);
  if (config.image) setMeta('property', 'og:image', config.image);
  if (config.url) setMeta('property', 'og:url', config.url);
  setMeta('property', 'og:type', config.type || 'website');

  // 4. Twitter Card Tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  if (config.title) setMeta('name', 'twitter:title', config.title);
  if (config.description) setMeta('name', 'twitter:description', config.description);
  if (config.image) setMeta('name', 'twitter:image', config.image);

  // 5. Canonical Link
  if (config.canonical) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', config.canonical);
  }

  // 6. Schema.org JSON-LD Structured Data
  const SCRIPT_ID = 'json-ld-structured-data';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (config.structuredData) {
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(config.structuredData);
  } else if (script) {
    script.remove();
  }
}

export function resetMetaTags() {
  document.title = DEFAULT_TITLE;
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', DEFAULT_DESCRIPTION);
  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  if (ogTitleEl) ogTitleEl.setAttribute('content', DEFAULT_TITLE);
  const ogDescEl = document.querySelector('meta[property="og:description"]');
  if (ogDescEl) ogDescEl.setAttribute('content', DEFAULT_DESCRIPTION);

  const script = document.getElementById('json-ld-structured-data');
  if (script) script.remove();
}
