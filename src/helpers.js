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
        return (amount < 1 || amount > 999999999999.99) ? false : amount.toFixed(2);
      }

      case 'ageLimit': {
        let amount;
        if (typeof thing === 'string') {
          const re = /^[0-9]*$/;
          if (!re.test(thing)) {
            return false;
          }
          amount = parseInt(thing, 10);
        } else if (typeof thing === 'number' && Number.isInteger(thing)) {
          amount = thing;
        } else {
          return false;
        }
        return (amount < 1 || amount > 99) ? false : Math.floor(amount);
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

      case 'uuid': {
        if (typeof thing !== 'string') {
          return false;
        }
        const re = /^[0-9A-Fa-f]{32}$/;
        return re.test(thing) ? thing : false;
      }

      // Must be 12-digit
      case 'personNummer': {
        if (typeof thing !== 'string' || !/^[0-9-]*$/.test(thing)) {
          return false;
        }
        let personNummer = thing.replace(/-/, '');
        if (personNummer.length !== 10 && personNummer.length !== 12) {
          return false;
        }

        // Ensure year is 4 digit
        const yearNow = new Date().getFullYear();
        let year;
        if (personNummer.length === 10) {
          year = parseInt(`29${personNummer.substring(0, 2)}`, 10);
          while (year > yearNow) {
            year -= 100;
          }
          personNummer = `${year}${personNummer.substring(2)}`;
        } else {
          year = parseInt(personNummer.substring(0, 4), 10);
        }
        if (year + 120 <= yearNow) {
          return false;
        }

        // Calculate Control Digit
        let num = parseInt(personNummer.substring(2, 11), 10);
        let controlDigit = 0;
        let multiplier = 2;
        while (num > 0) {
          let product = (num % 10) * multiplier;
          while (product > 0) {
            controlDigit += product % 10;
            product = Math.floor(product / 10);
          }

          num = Math.floor(num / 10);
          multiplier = multiplier === 2 ? 1 : 2;
        }
        controlDigit = (10 - (controlDigit % 10)) % 10;
        if (controlDigit !== parseInt(personNummer.substring(11), 10)) {
          return false;
        }

        // Check final formatting
        const re = /^(19|2[0-9])[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|30|31)[0-9]{4}$/;
        return re.test(personNummer) ? personNummer : false;
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
