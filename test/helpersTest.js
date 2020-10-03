/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirementss
const assert = require('assert').strict;
const { getSwishID, verify } = require('../src/helpers');

describe('Helpers comprise...', function () {
  describe('a Swish ID generator that...', function () {
    it('generates IDs with 32 hexadecimal numerals', function () {
      const re = /^[0-9A-F]{32}$/;
      for (let i = 0; i < 1000; i += 1) {
        const id = getSwishID();
        assert.strictEqual(id.length, 32);
        assert(re.test(id));
      }
    });
  });

  describe('functions that verify...', function () {
    describe('Merchant Aliases by...', function () {
      it('approving aliases with 10 numeric digits and spaces', function () {
        assert.strictEqual(verify('123 646 7983', 'merchantAlias'), '1236467983');
        assert.strictEqual(verify('123 976 2836', 'merchantAlias'), '1239762836');
        assert.strictEqual(verify('1236782918', 'merchantAlias'), '1236782918');
        assert.strictEqual(verify('1 2   38 6    4    9   8     6     2', 'merchantAlias'), '1238649862');
        assert.strictEqual(verify('   1231231231 ', 'merchantAlias'), '1231231231');
        assert.strictEqual(verify('1 2 39762833', 'merchantAlias'), '1239762833');
      });

      it('failing aliases which do not start with 123', function () {
        assert.strictEqual(verify('1246489253', 'merchantAlias'), false);
        assert.strictEqual(verify('9874892539', 'merchantAlias'), false);
        assert.strictEqual(verify('1297483657', 'merchantAlias'), false);
        assert.strictEqual(verify('0123987458', 'merchantAlias'), false);
        assert.strictEqual(verify('7846183648', 'merchantAlias'), false);
      });

      it('failing aliases that are not 10 digits long', function () {
        assert.strictEqual(verify('123', 'merchantAlias'), false);
        assert.strictEqual(verify('', 'merchantAlias'), false);
        assert.strictEqual(verify('12375892830', 'merchantAlias'), false);
        assert.strictEqual(verify('123756987', 'merchantAlias'), false);
      });

      it('failing aliases that contain non-numeric numerals', function () {
        assert.strictEqual(verify('123A798473', 'merchantAlias'), false);
        assert.strictEqual(verify('123!(*5739', 'merchantAlias'), false);
        assert.strictEqual(verify('123 HAT 5739', 'merchantAlias'), false);
        assert.strictEqual(verify('123.768283', 'merchantAlias'), false);
      });

      it('failing aliases that are not strings', function () {
        assert.strictEqual(verify(1237485938, 'merchantAlias'), false);
        assert.strictEqual(verify({ alias: '1236782918' }, 'merchantAlias'), false);
        assert.strictEqual(verify(['1236782918'], 'merchantAlias'), false);
        assert.strictEqual(verify(true, 'merchantAlias'), false);
        assert.strictEqual(verify(null, 'merchantAlias'), false);
        assert.strictEqual(verify(undefined, 'merchantAlias'), false);
      });
    });

    describe('Payer Alias by...', function () {
      it('approving aliases with between 8 and 15 digits (inc. code)', function () {
        assert.strictEqual(verify('07968726312', 'payerAlias'), '467968726312');
        assert.strictEqual(verify('+468976283647', 'payerAlias'), '468976283647');
        assert.strictEqual(verify('+0142543', 'payerAlias'), '46142543');
        assert.strictEqual(verify('+46 (0) 7365 21-81', 'payerAlias'), '4673652181');
        assert.strictEqual(verify('1 2   38 6    4    9   8     6     2', 'payerAlias'), '461238649862');
        assert.strictEqual(verify('08275829384768', 'payerAlias'), '468275829384768');
        assert.strictEqual(verify('0000000046000000078913875', 'payerAlias'), '4678913875');
      });

      it('failing aliases with less than 8 or more than 15 digits (inc. code)', function () {
        assert.strictEqual(verify('123', 'payerAlias'), false);
        assert.strictEqual(verify('4672986', 'payerAlias'), false);
        assert.strictEqual(verify('071984769284562', 'payerAlias'), false);
        assert.strictEqual(verify('46 7     9 0     2  1', 'payerAlias'), false);
        assert.strictEqual(verify('', 'payerAlias'), false);
        assert.strictEqual(verify('0000072374', 'payerAlias'), false);
      });

      it('failing aliases that are not strings', function () {
        assert.strictEqual(verify(1237485938, 'payerAlias'), false);
        assert.strictEqual(verify({ phoneNumber: '1236782918' }, 'payerAlias'), false);
        assert.strictEqual(verify(['1236782918'], 'payerAlias'), false);
        assert.strictEqual(verify(true, 'payerAlias'), false);
        assert.strictEqual(verify(null, 'payerAlias'), false);
        assert.strictEqual(verify(undefined, 'payerAlias'), false);
      });
    });

    describe('Callback URL by...', function () {
      it('approving urls with https protocol', function () {
        assert.strictEqual(verify('https://www.google.com/', 'callbackUrl'), 'https://www.google.com/');
        assert.strictEqual(verify('https://abacus', 'callbackUrl'), 'https://abacus/');
        assert.strictEqual(verify('https://swish-callback.com/', 'callbackUrl'), 'https://swish-callback.com/');
      });

      it('failing urls without protocol', function () {
        assert.strictEqual(verify('www.google.com', 'callbackUrl'), false);
        assert.strictEqual(verify('google.com', 'callbackUrl'), false);
      });

      it('failing urls without https protocol', function () {
        assert.strictEqual(verify('http://www.google.com/', 'callbackUrl'), false);
      });

      it('failing urls that are not strings', function () {
        assert.strictEqual(verify(76897238497389, 'callbackUrl'), false);
        assert.strictEqual(verify({ callbackUrl: 'https://www.google.com/' }, 'callbackUrl'), false);
        assert.strictEqual(verify(['https://www.google.com/'], 'callbackUrl'), false);
        assert.strictEqual(verify(true, 'callbackUrl'), false);
        assert.strictEqual(verify(null, 'callbackUrl'), false);
        assert.strictEqual(verify(undefined, 'callbackUrl'), false);
      });
    });

    describe('Amount by...', function () {
      it('approving amounts between 1 and 999999999999.99 SEK', function () {
        assert.strictEqual(verify('200', 'amount'), '200.00');
        assert.strictEqual(verify('1', 'amount'), '1.00');
        assert.strictEqual(verify(1, 'amount'), '1.00');
        assert.strictEqual(verify('999999999999.99', 'amount'), '999999999999.99');
        assert.strictEqual(verify(999999999999.99, 'amount'), '999999999999.99');
      });

      it('formatting amounts to 2 decimal places with rounding', function () {
        assert.strictEqual(verify('200.009', 'amount'), '200.01');
        assert.strictEqual(verify(498.9999999, 'amount'), '499.00');
        assert.strictEqual(verify('767.1', 'amount'), '767.10');
        assert.strictEqual(verify('1.14', 'amount'), '1.14');
        assert.strictEqual(verify(645.6926962, 'amount'), '645.69');
        assert.strictEqual(verify(326, 'amount'), '326.00');
        assert.strictEqual(verify('5523', 'amount'), '5523.00');
      });

      it('failing amounts that are less than 1 or more than 999999999999.99', function () {
        assert.strictEqual(verify(0.99, 'amount'), false);
        assert.strictEqual(verify('0.99', 'amount'), false);
        assert.strictEqual(verify(1000000000000, 'amount'), false);
        assert.strictEqual(verify('1000000000000', 'amount'), false);
        assert.strictEqual(verify('0', 'amount'), false);
        assert.strictEqual(verify('-100', 'amount'), false);
        assert.strictEqual(verify('10000000000000', 'amount'), false);
      });

      it('failing invalid strings', function () {
        assert.strictEqual(verify('invalid', 'amount'), false);
        assert.strictEqual(verify('165.34end', 'amount'), false);
        assert.strictEqual(verify('16L5.23', 'amount'), false);
        assert.strictEqual(verify('l33t', 'amount'), false);
      });

      it('failing amounts that are not strings or numbers', function () {
        assert.strictEqual(verify({ amount: '1236782918' }, 'amount'), false);
        assert.strictEqual(verify(['1236782918'], 'amount'), false);
        assert.strictEqual(verify(true, 'amount'), false);
        assert.strictEqual(verify(null, 'amount'), false);
        assert.strictEqual(verify(undefined, 'amount'), false);
      });
    });

    describe('Age Limit by...', function () {
      it('approving numbers or strings between 1 and 99', function () {
        assert.strictEqual(verify('1', 'ageLimit'), 1);
        assert.strictEqual(verify('99', 'ageLimit'), 99);
        assert.strictEqual(verify(45, 'ageLimit'), 45);
        assert.strictEqual(verify(16, 'ageLimit'), 16);
        assert.strictEqual(verify(79, 'ageLimit'), 79);
      });

      it('failing numbers that are less than 1 or more than 99', function () {
        assert.strictEqual(verify(0, 'ageLimit'), false);
        assert.strictEqual(verify('0', 'ageLimit'), false);
        assert.strictEqual(verify(100, 'ageLimit'), false);
        assert.strictEqual(verify('100', 'ageLimit'), false);
        assert.strictEqual(verify('0', 'ageLimit'), false);
        assert.strictEqual(verify('-4', 'ageLimit'), false);
        assert.strictEqual(verify('-1', 'ageLimit'), false);
      });

      it('failing non-integers', function () {
        assert.strictEqual(verify('0.99', 'ageLimit'), false);
        assert.strictEqual(verify('1.1', 'ageLimit'), false);
        assert.strictEqual(verify(99.1, 'ageLimit'), false);
        assert.strictEqual(verify(0.9, 'ageLimit'), false);
        assert.strictEqual(verify(50.5342342, 'ageLimit'), false);
        assert.strictEqual(verify('24.7', 'ageLimit'), false);
      });

      it('failing invalid strings', function () {
        assert.strictEqual(verify('invalid', 'ageLimit'), false);
        assert.strictEqual(verify('165.34end', 'ageLimit'), false);
        assert.strictEqual(verify('16L5.23', 'ageLimit'), false);
        assert.strictEqual(verify('l33t', 'ageLimit'), false);
      });

      it('failing numbers that are not strings or numbers', function () {
        assert.strictEqual(verify({ ageLimit: '45' }, 'ageLimit'), false);
        assert.strictEqual(verify(['45'], 'ageLimit'), false);
        assert.strictEqual(verify(true, 'ageLimit'), false);
        assert.strictEqual(verify(null, 'ageLimit'), false);
        assert.strictEqual(verify(undefined, 'ageLimit'), false);
      });
    });

    describe('Message by...', function () {
      it('allowing messages up to 50 allowable characters', function () {
        assert.strictEqual(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx', 'message'), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
        assert.strictEqual(verify('yz(012)3456789:åäöÅÄÖ', 'message'), 'yz(012)3456789:åäöÅÄÖ');
        assert.strictEqual(verify('"?"', 'message'), '"?"');
        assert.strictEqual(verify('!,.', 'message'), '!,.');
        assert.strictEqual(verify('', 'message'), '');
      });

      it('failing messages over 50 characters', function () {
        assert.strictEqual(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy', 'message'), false);
      });

      it('failing messages with disallowed characters', function () {
        assert.strictEqual(verify('{no]', 'message'), false);
        assert.strictEqual(verify('£#ajklj]', 'message'), false);
      });

      it('failing messages that are not strings', function () {
        assert.strictEqual(verify(76897238497389, 'message'), false);
        assert.strictEqual(verify({ message: 'message' }, 'message'), false);
        assert.strictEqual(verify(['message'], 'message'), false);
        assert.strictEqual(verify(true, 'message'), false);
        assert.strictEqual(verify(null, 'message'), false);
        assert.strictEqual(verify(undefined, 'message'), false);
      });
    });

    describe('Payee Payment Reference by...', function () {
      it('allowing references from 1 to 36 allowable characters', function () {
        assert.strictEqual(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij', 'payeePaymentReference'), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij');
        assert.strictEqual(verify('klmnopqrstuvwxyz0123456789', 'payeePaymentReference'), 'klmnopqrstuvwxyz0123456789');
        assert.strictEqual(verify('J', 'payeePaymentReference'), 'J');
        assert.strictEqual(verify('Aa9', 'payeePaymentReference'), 'Aa9');
      });

      it('failing empty references and references over 36 characters', function () {
        assert.strictEqual(verify('', 'payeePaymentReference'), false);
        assert.strictEqual(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk', 'payeePaymentReference'), false);
      });

      it('failing messages with disallowed characters', function () {
        assert.strictEqual(verify('AB!', 'payeePaymentReference'), false);
        assert.strictEqual(verify('Lf$', 'payeePaymentReference'), false);
        assert.strictEqual(verify('j£u', 'payeePaymentReference'), false);
        assert.strictEqual(verify('[huj]', 'payeePaymentReference'), false);
      });

      it('failing messages that are not strings', function () {
        assert.strictEqual(verify(12351234, 'payeePaymentReference'), false);
        assert.strictEqual(verify({ payeePaymentReference: 'ref' }, 'payeePaymentReference'), false);
        assert.strictEqual(verify(['ref'], 'payeePaymentReference'), false);
        assert.strictEqual(verify(true, 'payeePaymentReference'), false);
        assert.strictEqual(verify(null, 'payeePaymentReference'), false);
        assert.strictEqual(verify(undefined, 'payeePaymentReference'), false);
      });
    });

    describe('Personnummer by...', function () {
      it('allowing numbers of 10 or 12 numbers with hypen', function () {
        assert.strictEqual(verify('8112189876', 'personNummer'), '198112189876');
        assert.strictEqual(verify('870912-6760', 'personNummer'), '198709126760');
        assert.strictEqual(verify('198909191788', 'personNummer'), '198909191788');
        assert.strictEqual(verify('9902018879', 'personNummer'), '199902018879');
      });

      it('failing numbers that are older than 120 years', function () {
        assert.strictEqual(verify('18730909-1572', 'personNummer'), false);
        assert.strictEqual(verify('19000909-1572', 'personNummer'), false);
      });

      it('failing numbers with incorrect control digit', function () {
        assert.strictEqual(verify('197608186687', 'personNummer'), false);
      });

      it('failing numbers that are incorrect length', function () {
        assert.strictEqual(verify('18730909-157', 'personNummer'), false);
        assert.strictEqual(verify('19000909-15726', 'personNummer'), false);
      });

      it('failing numbers with non numerals and hyphens', function () {
        assert.strictEqual(verify('197212!18879', 'personNummer'), false);
        assert.strictEqual(verify('197212AB8879', 'personNummer'), false);
        assert.strictEqual(verify('19721211887$', 'personNummer'), false);
        assert.strictEqual(verify('{}7212118879', 'personNummer'), false);
      });

      it('failing numbers that are not strings', function () {
        assert.strictEqual(verify(198409147892, 'personNummer'), false);
        assert.strictEqual(verify({ personNummer: '199301015578' }, 'personNummer'), false);
        assert.strictEqual(verify(['199301015578'], 'personNummer'), false);
        assert.strictEqual(verify(true, 'personNummer'), false);
        assert.strictEqual(verify(null, 'personNummer'), false);
        assert.strictEqual(verify(undefined, 'personNummer'), false);
      });
    });

    describe('Verification Type by...', function () {
      it('failing on incorrect verification type', function () {
        assert.strictEqual(verify('INCORRECT', 'notAType'), false);
        assert.strictEqual(verify(1674638, 12542), false);
        assert.strictEqual(verify('200', { type: 'amount' }), false);
      });
    });
  });
});
