const { POISSON } = require('../build-config/constants');

function validateNumber(value, min = 0, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Wert muss eine Zahl sein' };
  }
  if (num < min) {
    return { valid: false, error: `Wert muss mindestens ${min} sein` };
  }
  if (num > max) {
    return { valid: false, error: `Wert darf maximal ${max} sein` };
  }
  return { valid: true, value: num };
}

function validatePoissonInput(data) {
  const errors = [];
  
  const nValidation = validateNumber(data.n, 1);
  if (!nValidation.valid) {
    errors.push({ field: 'n', message: nValidation.error });
  }
  
  POISSON.CATEGORIES.forEach(cat => {
    const kValidation = validateNumber(data[`k_${cat.key}`], 0);
    if (!kValidation.valid) {
      errors.push({ field: `k_${cat.key}`, message: kValidation.error });
    }
    
    const pValidation = validateNumber(data[`p_${cat.key}`], 0, 1);
    if (!pValidation.valid) {
      errors.push({ field: `p_${cat.key}`, message: pValidation.error });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    data: nValidation.valid ? { ...data, n: nValidation.value } : data
  };
}

function validateSettings(settings) {
  const validSettings = {};
  const errors = [];
  
  if (typeof settings.theme === 'string' && ['light', 'dark'].includes(settings.theme)) {
    validSettings.theme = settings.theme;
  }
  
  if (typeof settings.autoSave === 'boolean') {
    validSettings.autoSave = settings.autoSave;
  }
  
  if (typeof settings.apiEnabled === 'boolean') {
    validSettings.apiEnabled = settings.apiEnabled;
  }
  
  if (typeof settings.apiEndpoint === 'string' && settings.apiEndpoint.length > 0) {
    try {
      new URL(settings.apiEndpoint);
      validSettings.apiEndpoint = settings.apiEndpoint;
    } catch (e) {
      errors.push({ field: 'apiEndpoint', message: 'Ungültige URL' });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: validSettings
  };
}

module.exports = {
  validateNumber,
  validatePoissonInput,
  validateSettings
};
