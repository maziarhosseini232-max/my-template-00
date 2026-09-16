import { db } from '../db/index.js';
import { SeoMetadata } from '../db/schema.js';
import { config } from '../config/index.js';

export class SeoService {
  async getSeoForEntity(entityType: string, entityId: string): Promise<SeoMetadata | null> {
    const meta = db.seoMetadata.find(
      s => s.entityType === entityType && s.entityId === entityId
    );
    if (meta) return meta;

    // Fallback dynamic generation for Courses
    if (entityType === 'COURSE') {
      const course = db.courses.find(c => c.id === entityId || c.slug === entityId);
      if (course) {
        return {
          id: 'dyn_seo_' + course.id,
          entityType: 'COURSE',
          entityId: course.id,
          title: `${course.title} | لومینا لرن`,
          description: course.shortDescription || course.description.slice(0, 160),
          canonical: `${config.siteUrl}/courses/${course.slug}`,
          robots: 'index, follow',
          ogTitle: course.title,
          ogDescription: course.shortDescription,
          ogImage: course.thumbnail,
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: course.shortDescription,
            provider: {
              '@type': 'Organization',
              name: 'Lumina Learn',
              sameAs: config.siteUrl
            }
          }
        };
      }
    }

    return null;
  }

  async updateSeoMetadata(data: SeoMetadata) {
    const idx = db.seoMetadata.findIndex(
      s => s.entityType === data.entityType && s.entityId === data.entityId
    );
    if (idx !== -1) {
      db.seoMetadata[idx] = { ...db.seoMetadata[idx], ...data };
      return db.seoMetadata[idx];
    } else {
      db.seoMetadata.push(data);
      return data;
    }
  }

  generateSitemapXml(customBaseUrl?: string): string {
    const rawBase = customBaseUrl || config.siteUrl;
    const baseUrl = rawBase.replace(/\/+$/, '');
    const now = new Date().toISOString().split('T')[0];

    let urls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/catalog`, priority: '0.9', changefreq: 'daily' }
    ];

    // Add courses
    db.courses.filter(c => c.status === 'PUBLISHED' && !c.deletedAt).forEach(c => {
      urls.push({
        loc: `${baseUrl}/courses/${c.slug || c.id}`,
        priority: '0.8',
        changefreq: 'weekly'
      });
    });

    // Add digital products
    db.digitalProducts.forEach(p => {
      urls.push({
        loc: `${baseUrl}/files/${p.slug || p.id}`,
        priority: '0.7',
        changefreq: 'weekly'
      });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  generateRobotsTxt(customBaseUrl?: string): string {
    const rawBase = customBaseUrl || config.siteUrl;
    const baseUrl = rawBase.replace(/\/+$/, '');
    return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /checkout
Disallow: /payment
Disallow: /lumina-secure-portal

Sitemap: ${baseUrl}/sitemap.xml
`;
  }
}

export const seoService = new SeoService();
