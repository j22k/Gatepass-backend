const validator = require('validator');

/**
 * Validation utilities for input sanitization and validation
 * Provides common validation patterns used across the application
 */
const validationUtils = {
  /**
   * Validates email format using validator library
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email format
   */
  isValidEmail(email) {
    return email && typeof email === 'string' && validator.isEmail(email.trim());
  },

  /**
   * Validates international phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid phone format or empty (optional)
   */
  isValidPhone(phone) {
    if (!phone) return true; // Phone is optional in most cases
    return typeof phone === 'string' && /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Validates strong password requirements
   * Must have: 8+ chars, uppercase, lowercase, number, special character
   * @param {string} password - Password to validate
   * @returns {boolean} - True if meets strength requirements
   */
  isStrongPassword(password) {
    if (!password || typeof password !== 'string') return false;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  },

  /**
   * Validates UUID v4 format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} - True if valid UUID format
   */
  isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  },

  /**
   * Validates date in YYYY-MM-DD format and ensures it's not in the past
   * @param {string} dateString - Date string to validate
   * @returns {boolean} - True if valid future date
   */
  isValidFutureDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },

  /**
   * Validates name format (letters, spaces, hyphens, apostrophes, dots)
   * @param {string} name - Name to validate
   * @returns {boolean} - True if valid name format
   */
  isValidName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 100 && /^[a-zA-Z\s\-'\.]+$/.test(trimmed);
  },

  /**
   * Validates text length within specified bounds
   * @param {string} text - Text to validate
   * @param {number} minLength - Minimum length (default: 1)
   * @param {number} maxLength - Maximum length (default: 500)
   * @returns {boolean} - True if text length is valid
   */
  isValidText(text, minLength = 1, maxLength = 500) {
    if (text === null || text === undefined) return true; // Optional fields
    if (typeof text !== 'string') return false;
    const trimmed = text.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  /**
   * Sanitizes string input by trimming and normalizing whitespace
   * @param {string} str - String to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeString(str) {
    if (!str || typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
  },

  /**
   * Validates array of accompanying persons for visit requests
   * @param {Array} persons - Array of person objects to validate
   * @returns {boolean} - True if all persons are valid
   */
  isValidAccompanyingPersons(persons) {
    if (!persons) return true; // Optional field
    if (!Array.isArray(persons)) return false;
    if (persons.length > 10) return false; // Business rule: max 10 accompanying persons
    
    return persons.every(person => {
      if (!person || typeof person !== 'object') return false;
      
      // Name is required for each accompanying person
      if (!this.isValidName(person.name)) return false;
      
      // Phone and email are optional but must be valid if provided
      if (person.phone && !this.isValidPhone(person.phone)) return false;
      if (person.email && !this.isValidEmail(person.email)) return false;
      
      return true;
    });
  },

  /**
   * Creates a standardized validation error response
   * @param {Array} errors - Array of validation error messages
   * @returns {Object} - Formatted error response object
   */
  createValidationError(errors) {
    return {
      error: "Validation failed",
      details: errors,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = validationUtils;
