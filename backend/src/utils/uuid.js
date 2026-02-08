const { v4: uuidv4 } = require('uuid');

/**
 * Generate UUID v4
 */
function generateId() {
    return uuidv4();
}

module.exports = {
    generateId
};
