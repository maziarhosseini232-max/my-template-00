import { db } from '../db/index.js';
import { HomepageSection, SiteSetting, NavigationItem } from '../db/schema.js';

export class CmsService {
  // Homepage Sections (Site Builder)
  async getHomepageSections() {
    return [...db.homepageSections].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async updateHomepageSection(id: string, data: Partial<HomepageSection>) {
    const section = db.homepageSections.find(s => s.id === id);
    if (!section) throw new Error('سکشن یافت نشد.');

    if (data.title !== undefined) section.title = data.title;
    if (data.subtitle !== undefined) section.subtitle = data.subtitle;
    if (data.isEnabled !== undefined) section.isEnabled = data.isEnabled;
    if (data.orderIndex !== undefined) section.orderIndex = data.orderIndex;
    if (data.content !== undefined) section.content = { ...section.content, ...data.content };
    if (data.styleConfig !== undefined) section.styleConfig = { ...section.styleConfig, ...data.styleConfig };

    section.updatedAt = new Date().toISOString();
    return section;
  }

  async reorderHomepageSections(sectionIdsInOrder: string[]) {
    sectionIdsInOrder.forEach((id, index) => {
      const sec = db.homepageSections.find(s => s.id === id);
      if (sec) {
        sec.orderIndex = index + 1;
        sec.updatedAt = new Date().toISOString();
      }
    });
    return this.getHomepageSections();
  }

  async addCustomHomepageSection(data: { title: string; sectionType?: any; content: Record<string, any> }) {
    const newSec: HomepageSection = {
      id: 'sec_custom_' + Date.now(),
      sectionType: data.sectionType || 'Custom',
      title: data.title,
      orderIndex: db.homepageSections.length + 1,
      isEnabled: true,
      content: data.content || {},
      updatedAt: new Date().toISOString()
    };
    db.homepageSections.push(newSec);
    return newSec;
  }

  async deleteHomepageSection(id: string) {
    const idx = db.homepageSections.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('سکشن یافت نشد.');
    db.homepageSections.splice(idx, 1);
    return { success: true, message: 'سکشن حذف شد.' };
  }

  // Site Settings
  async getSiteSettings() {
    return db.siteSetting;
  }

  async updateSiteSettings(data: Partial<SiteSetting>) {
    const isInstructorRegistrationEnabled = data.isInstructorRegistrationEnabled !== undefined
      ? Boolean(data.isInstructorRegistrationEnabled)
      : db.siteSetting.isInstructorRegistrationEnabled ?? false;

    const isAlacarteSaleEnabled = data.isAlacarteSaleEnabled !== undefined
      ? Boolean(data.isAlacarteSaleEnabled)
      : db.siteSetting.isAlacarteSaleEnabled ?? false;

    db.siteSetting = {
      ...db.siteSetting,
      ...data,
      isInstructorRegistrationEnabled,
      isAlacarteSaleEnabled,
      updatedAt: new Date().toISOString()
    };
    db.saveSnapshotSync();
    return db.siteSetting;
  }

  // Navigation CMS
  async getNavigationItems(menuLocation?: string) {
    let items = db.navigationItems;
    if (menuLocation) {
      items = items.filter(n => n.menuLocation === menuLocation);
    }
    return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async addNavigationItem(data: Omit<NavigationItem, 'id'>) {
    const newItem: NavigationItem = {
      id: 'nav_' + Date.now(),
      ...data
    };
    db.navigationItems.push(newItem);
    return newItem;
  }

  async updateNavigationItem(id: string, data: Partial<NavigationItem>) {
    const item = db.navigationItems.find(n => n.id === id);
    if (!item) throw new Error('آیتم منو یافت نشد.');
    Object.assign(item, data);
    return item;
  }

  async deleteNavigationItem(id: string) {
    const idx = db.navigationItems.findIndex(n => n.id === id);
    if (idx === -1) throw new Error('آیتم منو یافت نشد.');
    db.navigationItems.splice(idx, 1);
    return { success: true, message: 'آیتم منو حذف شد.' };
  }
}

export const cmsService = new CmsService();
