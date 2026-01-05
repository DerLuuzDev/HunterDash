const { STORAGE, TEMPLATES } = require('../build-config/constants');

class TemplateService {
  constructor(storageService) {
    this.storage = storageService;
  }

  async getTemplates() {
    try {
      const templates = await this.storage.get(STORAGE.KEYS.TEMPLATES) || [];
      return [...TEMPLATES.PRESETS, ...templates];
    } catch (error) {
      console.error('TemplateService: Fehler beim Laden:', error);
      return [...TEMPLATES.PRESETS];
    }
  }

  async getTemplate(id) {
    try {
      const templates = await this.getTemplates();
      return templates.find(t => t.id === id) || null;
    } catch (error) {
      console.error('TemplateService: Fehler beim Suchen:', error);
      return null;
    }
  }

  async saveTemplate(name, data) {
    try {
      const customTemplates = await this.storage.get(STORAGE.KEYS.TEMPLATES) || [];
      const existingIndex = customTemplates.findIndex(t => t.name === name);

      const newTemplate = {
        id: Date.now().toString(),
        name,
        description: 'Benutzerdefiniertes Template',
        data,
        createdAt: new Date().toISOString(),
        isCustom: true
      };

      if (existingIndex >= 0) {
        customTemplates[existingIndex] = { ...customTemplates[existingIndex], ...newTemplate, id: customTemplates[existingIndex].id };
      } else {
        customTemplates.push(newTemplate);
      }

      await this.storage.set(STORAGE.KEYS.TEMPLATES, customTemplates);
      return { success: true, template: newTemplate };
    } catch (error) {
      console.error('TemplateService: Fehler beim Speichern:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTemplate(id) {
    try {
      const templates = await this.storage.get(STORAGE.KEYS.TEMPLATES) || [];
      
      if (templates.some(t => !t.isCustom)) {
        return { success: false, error: 'Standard-Templates können nicht gelöscht werden' };
      }

      const filtered = templates.filter(t => t.id !== id);
      await this.storage.set(STORAGE.KEYS.TEMPLATES, filtered);
      return { success: true };
    } catch (error) {
      console.error('TemplateService: Fehler beim Löschen:', error);
      return { success: false, error: error.message };
    }
  }

  async updateTemplate(id, name, data) {
    try {
      const templates = await this.storage.get(STORAGE.KEYS.TEMPLATES) || [];
      const index = templates.findIndex(t => t.id === id);

      if (index < 0) {
        return { success: false, error: 'Template nicht gefunden' };
      }

      if (!templates[index].isCustom) {
        return { success: false, error: 'Standard-Templates können nicht bearbeitet werden' };
      }

      templates[index] = {
        ...templates[index],
        name,
        data,
        updatedAt: new Date().toISOString()
      };

      await this.storage.set(STORAGE.KEYS.TEMPLATES, templates);
      return { success: true, template: templates[index] };
    } catch (error) {
      console.error('TemplateService: Fehler beim Aktualisieren:', error);
      return { success: false, error: error.message };
    }
  }
}

const templateService = new TemplateService(require('./storage.service'));

module.exports = templateService;
