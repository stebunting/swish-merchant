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
        const re = /^123[0-9]{7}$/;
        const alias = thing.replace(/ /g, '');
        return re.test(alias) ? alias : false;
      }

      case 'payerAlias': {
        if (typeof thing !== 'string') {
          return false;
        }
        let alias = thing.replace(/[^0-9]/g, '');
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
        const re = /^46[1-9][0-9]{5,12}$/;
        return re.test(alias) ? alias : false;
      }

      case 'callbackUrl': {
        if (typeof thing !== 'string') {
          return false;
        }
        try {
          const url = new URL(thing);
          return url.protocol === 'https:' ? url.toString() : false;
        } catch (error) {
          return false;
        }
      }

      case 'amount': {
        let amount;
        if (typeof thing === 'string') {
          const re = /^[0-9]*\.?[0-9]*$/;
          if (!re.test(thing)) {
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
        if (typeof thing !== 'string') {
          return false;
        }
        const re = /^[0-9a-zA-ZåäöÅÄÖ :;.,?!()"]{0,50}$/;
        return re.test(thing) ? thing : false;
      }

      case 'payeePaymentReference': {
        if (typeof thing !== 'string') {
          return false;
        }
        const re = /^[0-9A-Za-z]{1,36}$/;
        return re.test(thing) ? thing : false;
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
