// Requirements
const { v4: uuidv4 } = require('uuid');

function helpers() {
  // Function to return a UUID suitable for Swish
  // 32 characters, no dashes, capitals
  function getSwishID() {
    return uuidv4().replace(/-/g, '').toUpperCase();
  }

  function verify(thing, type) {
    // All types must be string type
    if (typeof thing !== 'string') {
      return false;
    }

    switch (type) {
      case 'merchantAlias': {
        const re = /^(^123)[0-9]+$/;
        const alias = thing.replace(/ /g, '');
        if (re.test(alias) && alias.length === 10) {
          return alias;
        }
        return false;
      }
      case 'callbackUrl': {
        let url;
        try {
          url = new URL(thing);
        } catch (error) {
          return false;
        }
        if (url.protocol === 'https:') {
          return url.toString();
        }
        return false;
      }
      default:
        return false;
    }
  }

  return {
    getSwishID,
    verify
  };
}

module.exports = helpers();
