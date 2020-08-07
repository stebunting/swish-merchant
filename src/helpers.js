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

      // Must be 12-digit
      case 'personNummer': {
        if (typeof thing !== 'string' || !/^[0-9-]*$/.test(thing)) {
          return false;
        }
        let number = thing.replace(/-/, '');
        if (number.length !== 10 && number.length !== 12) {
          return false;
        }
        const yearNow = new Date().getFullYear();
        if (number.length === 10) {
          let year = parseInt(`25${number.substring(0, 2)}`, 10);
          while (year > yearNow) {
            year -= 100;
          }
          number = `${year}${number.substring(2)}`;
        }
        if (parseInt(number.substring(0, 4), 10) + 120 <= yearNow) {
          return false;
        }

        // Calculate Control Digit
        let stageOne = '';
        const num = number.substring(2, 11);
        for (let i = 0; i < 9; i += 1) {
          stageOne += parseInt(num.charAt(i), 10) * (((i + 1) % 2) + 1).toString();
        }
        let sum = 0;
        for (let i = 0; i < stageOne.length; i += 1) {
          sum += parseInt(stageOne[i], 10);
        }
        const controlDigit = (10 - (sum % 10)) % 10;
        if (controlDigit.toString() !== number.substring(11)) {
          return false;
        }

        const re = /^[12][0-9]{3}[01][0-9][0-3][0-9]{5}$/;
        return re.test(number) ? number : false;
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
