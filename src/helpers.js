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
    switch (type) {
      case 'merchantAlias': {
        if (typeof thing !== 'string') {
          return false;
        }
        const re = /^(^123)[0-9]+$/;
        const alias = thing.replace(/ /g, '');
        if (re.test(alias) && alias.length === 10) {
          return alias;
        }
        return false;
      }

      case 'payerAlias': {
        if (typeof thing !== 'string') {
          return false;
        }
        let alias = thing.replace(/\D/g, '');
        while (alias.charAt(0) === '0') {
          alias = alias.substring(1);
        }
        if (alias.substring(0, 2) === '46') {
          alias = alias.substring(2);
          while (alias.charAt(0) === '0') {
            alias = alias.substring(1);
          }
        }
        alias = `46${alias}`;
        if (alias.length < 8 || alias.length > 15) {
          return false;
        }
        return alias;
      }

      case 'callbackUrl': {
        if (typeof thing !== 'string') {
          return false;
        }
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

      case 'amount': {
        let amount;
        if (typeof thing === 'string') {
          if (!/^[0-9.]+$/.test(thing)) {
            return false;
          }
          amount = parseFloat(thing, 10);
        } else if (typeof thing === 'number') {
          amount = thing;
        } else {
          return false;
        }
        if (amount < 1 || amount > 999999999999.99) {
          return false;
        }
        return amount.toFixed(2);
      }

      case 'message': {
        if (typeof thing !== 'string' || thing.length > 50) {
          return false;
        }
        const re = /^[0-9a-zA-ZåäöÅÄÖ :;.,?!()"]*$/;
        if (re.test(thing)) {
          return thing;
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
