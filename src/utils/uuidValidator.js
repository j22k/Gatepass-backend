/**
 * Validates if the provided string is a valid UUID (version 4).
 * @param {string} uuid - The UUID string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
const validateUuid = (uuid) => {
  if (typeof uuid !== 'string' || !uuid.trim()) {
    return false; // Handle null, undefined, or empty strings
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

module.exports = { validateUuid };
