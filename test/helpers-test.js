/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirementss
const assert = require('assert').strict;
const { getSwishID, verify } = require('../src/helpers');

describe('Swish Helper Tests', function () {
  describe('Swish ID getter...', function () {
    it('generates Swish IDs with exactly 32 hexadecimal numerals', function () {
      const re = /^[0-9A-F]{32}$/;
      for (let i = 0; i < 1000; i += 1) {
        const id = getSwishID();
        assert.equal(id.length, 32);
        assert(re.test(id));
      }
    });
  });

  describe('Merchant Alias verification...', function () {
    it('allows aliases with 10 numeric digits and spaces', function () {
      assert.equal(verify('123 646 7983', 'merchantAlias'), '1236467983');
      assert.equal(verify('123 976 2836', 'merchantAlias'), '1239762836');
      assert.equal(verify('1236782918', 'merchantAlias'), '1236782918');
      assert.equal(verify('1 2   38 6    4    9   8     6     2', 'merchantAlias'), '1238649862');
      assert.equal(verify('   1231231231 ', 'merchantAlias'), '1231231231');
      assert.equal(verify('1 2 39762833', 'merchantAlias'), '1239762833');
    });

    it('fails aliases which do not start with 123', function () {
      assert.equal(verify('1246489253', 'merchantAlias'), false);
      assert.equal(verify('9874892539', 'merchantAlias'), false);
      assert.equal(verify('1297483657', 'merchantAlias'), false);
      assert.equal(verify('0123987458', 'merchantAlias'), false);
      assert.equal(verify('7846183648', 'merchantAlias'), false);
    });

    it('fails aliases that are not 10 digits long', function () {
      assert.equal(verify('123', 'merchantAlias'), false);
      assert.equal(verify('', 'merchantAlias'), false);
      assert.equal(verify('12375892830', 'merchantAlias'), false);
      assert.equal(verify('123756987', 'merchantAlias'), false);
    });

    it('fails aliases that contain non-numeric numerals', function () {
      assert.equal(verify('123A798473', 'merchantAlias'), false);
      assert.equal(verify('123!(*5739', 'merchantAlias'), false);
      assert.equal(verify('123 HAT 5739', 'merchantAlias'), false);
      assert.equal(verify('123.768283', 'merchantAlias'), false);
    });

    it('fails aliases that are not strings', function () {
      assert.equal(verify(1237485938, 'merchantAlias'), false);
      assert.equal(verify({ alias: '1236782918' }, 'merchantAlias'), false);
      assert.equal(verify(['1236782918'], 'merchantAlias'), false);
      assert.equal(verify(true, 'merchantAlias'), false);
      assert.equal(verify(null, 'merchantAlias'), false);
      assert.equal(verify(undefined, 'merchantAlias'), false);
    });
  });

  describe('Payer Alias verification...', function () {
    it('allows aliases with between 8 and 15 digits (including code)', function () {
      assert.equal(verify('07968726312', 'payerAlias'), '467968726312');
      assert.equal(verify('+468976283647', 'payerAlias'), '468976283647');
      assert.equal(verify('+0142543', 'payerAlias'), '46142543');
      assert.equal(verify('+46 (0) 7365 21-81', 'payerAlias'), '4673652181');
      assert.equal(verify('1 2   38 6    4    9   8     6     2', 'payerAlias'), '461238649862');
      assert.equal(verify('08275829384768', 'payerAlias'), '468275829384768');
      assert.equal(verify('0000000046000000078913875', 'payerAlias'), '4678913875');
    });

    it('fails aliases with less than 8 or more than 15 digits (including code)', function () {
      assert.equal(verify('123', 'payerAlias'), false);
      assert.equal(verify('4672986', 'payerAlias'), false);
      assert.equal(verify('071984769284562', 'payerAlias'), false);
      assert.equal(verify('46 7     9 0     2  1', 'payerAlias'), false);
      assert.equal(verify('', 'payerAlias'), false);
      assert.equal(verify('0000072374', 'payerAlias'), false);
    });

    it('fails aliases that are not strings', function () {
      assert.equal(verify(1237485938, 'payerAlias'), false);
      assert.equal(verify({ phoneNumber: '1236782918' }, 'payerAlias'), false);
      assert.equal(verify(['1236782918'], 'payerAlias'), false);
      assert.equal(verify(true, 'payerAlias'), false);
      assert.equal(verify(null, 'payerAlias'), false);
      assert.equal(verify(undefined, 'payerAlias'), false);
    });
  });

  describe('Callback URL verification...', function () {
    it('allows urls with https protocol', function () {
      assert.equal(verify('https://www.google.com/', 'callbackUrl'), 'https://www.google.com/');
      assert.equal(verify('https://abacus', 'callbackUrl'), 'https://abacus/');
      assert.equal(verify('https://swish-callback.com/', 'callbackUrl'), 'https://swish-callback.com/');
    });

    it('fails urls without protocol', function () {
      assert.equal(verify('www.google.com', 'callbackUrl'), false);
      assert.equal(verify('google.com', 'callbackUrl'), false);
    });

    it('fails urls without https protocol', function () {
      assert.equal(verify('http://www.google.com/', 'callbackUrl'), false);
    });

    it('fails urls that are not strings', function () {
      assert.equal(verify(76897238497389, 'callbackUrl'), false);
      assert.equal(verify({ callbackUrl: 'https://www.google.com/' }, 'callbackUrl'), false);
      assert.equal(verify(['https://www.google.com/'], 'callbackUrl'), false);
      assert.equal(verify(true, 'callbackUrl'), false);
      assert.equal(verify(null, 'callbackUrl'), false);
      assert.equal(verify(undefined, 'callbackUrl'), false);
    });
  });

  describe('Amount verification...', function () {
    it('allows amounts between 1 and 999999999999.99 SEK', function () {
      assert.equal(verify('200', 'amount'), '200.00');
      assert.equal(verify('1', 'amount'), '1.00');
      assert.equal(verify(1, 'amount'), '1.00');
      assert.equal(verify('999999999999.99', 'amount'), '999999999999.99');
      assert.equal(verify(999999999999.99, 'amount'), '999999999999.99');
    });

    it('formats amounts to 2 decimal places with rounding', function () {
      assert.equal(verify('200.009', 'amount'), '200.01');
      assert.equal(verify(498.9999999, 'amount'), '499.00');
      assert.equal(verify('767.1', 'amount'), '767.10');
      assert.equal(verify('1.14', 'amount'), '1.14');
      assert.equal(verify(645.6926962, 'amount'), '645.69');
      assert.equal(verify(326, 'amount'), '326.00');
      assert.equal(verify('5523', 'amount'), '5523.00');
    });

    it('fails amounts that are less than 1 or more than 999999999999.99', function () {
      assert.equal(verify(0.99, 'amount'), false);
      assert.equal(verify('0.99', 'amount'), false);
      assert.equal(verify(1000000000000, 'amount'), false);
      assert.equal(verify('1000000000000', 'amount'), false);
      assert.equal(verify('0', 'amount'), false);
      assert.equal(verify('-100', 'amount'), false);
      assert.equal(verify('10000000000000', 'amount'), false);
    });

    it('fails invalid strings', function () {
      assert.equal(verify('invalid', 'amount'), false);
      assert.equal(verify('165.34end', 'amount'), false);
      assert.equal(verify('16L5.23', 'amount'), false);
      assert.equal(verify('l33t', 'amount'), false);
    });

    it('fails amounts that are not strings or numbers', function () {
      assert.equal(verify({ amount: '1236782918' }, 'amount'), false);
      assert.equal(verify(['1236782918'], 'amount'), false);
      assert.equal(verify(true, 'amount'), false);
      assert.equal(verify(null, 'amount'), false);
      assert.equal(verify(undefined, 'amount'), false);
    });
  });

  describe('Age Limit verification...', function () {
    it('allows numbers or strings between 1 and 99', function () {
      assert.equal(verify('1', 'ageLimit'), 1);
      assert.equal(verify('99', 'ageLimit'), 99);
      assert.equal(verify(45, 'ageLimit'), 45);
      assert.equal(verify(16, 'ageLimit'), 16);
      assert.equal(verify(79, 'ageLimit'), 79);
    });

    it('fails numbers that are less than 1 or more than 99', function () {
      assert.equal(verify(0, 'ageLimit'), false);
      assert.equal(verify('0', 'ageLimit'), false);
      assert.equal(verify(100, 'ageLimit'), false);
      assert.equal(verify('100', 'ageLimit'), false);
      assert.equal(verify('0', 'ageLimit'), false);
      assert.equal(verify('-4', 'ageLimit'), false);
      assert.equal(verify('-1', 'ageLimit'), false);
    });

    it('fails non-integers', function () {
      assert.equal(verify('0.99', 'ageLimit'), false);
      assert.equal(verify('1.1', 'ageLimit'), false);
      assert.equal(verify(99.1, 'ageLimit'), false);
      assert.equal(verify(0.9, 'ageLimit'), false);
      assert.equal(verify(50.5342342, 'ageLimit'), false);
      assert.equal(verify('24.7', 'ageLimit'), false);
    });

    it('fails invalid strings', function () {
      assert.equal(verify('invalid', 'ageLimit'), false);
      assert.equal(verify('165.34end', 'ageLimit'), false);
      assert.equal(verify('16L5.23', 'ageLimit'), false);
      assert.equal(verify('l33t', 'ageLimit'), false);
    });

    it('fails numbers that are not strings or numbers', function () {
      assert.equal(verify({ ageLimit: '45' }, 'ageLimit'), false);
      assert.equal(verify(['45'], 'ageLimit'), false);
      assert.equal(verify(true, 'ageLimit'), false);
      assert.equal(verify(null, 'ageLimit'), false);
      assert.equal(verify(undefined, 'ageLimit'), false);
    });
  });

  describe('Message verification...', function () {
    it('allows messages up to 50 allowable characters', function () {
      assert.equal(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx', 'message'), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
      assert.equal(verify('yz(012)3456789:åäöÅÄÖ', 'message'), 'yz(012)3456789:åäöÅÄÖ');
      assert.equal(verify('"?"', 'message'), '"?"');
      assert.equal(verify('!,.', 'message'), '!,.');
      assert.equal(verify('', 'message'), '');
    });

    it('fails messages over 50 characters', function () {
      assert.equal(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy', 'message'), false);
    });

    it('fails messages with disallowed characters', function () {
      assert.equal(verify('{no]', 'message'), false);
      assert.equal(verify('£#ajklj]', 'message'), false);
    });

    it('fails messages that are not strings', function () {
      assert.equal(verify(76897238497389, 'message'), false);
      assert.equal(verify({ message: 'message' }, 'message'), false);
      assert.equal(verify(['message'], 'message'), false);
      assert.equal(verify(true, 'message'), false);
      assert.equal(verify(null, 'message'), false);
      assert.equal(verify(undefined, 'message'), false);
    });
  });

  describe('Payee Payment Reference verification...', function () {
    it('allows references from 1 to 36 allowable characters', function () {
      assert.equal(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij', 'payeePaymentReference'), 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij');
      assert.equal(verify('klmnopqrstuvwxyz0123456789', 'payeePaymentReference'), 'klmnopqrstuvwxyz0123456789');
      assert.equal(verify('J', 'payeePaymentReference'), 'J');
      assert.equal(verify('Aa9', 'payeePaymentReference'), 'Aa9');
    });

    it('fails empty references and references over 36 characters', function () {
      assert.equal(verify('', 'payeePaymentReference'), false);
      assert.equal(verify('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk', 'payeePaymentReference'), false);
    });

    it('fails messages with disallowed characters', function () {
      assert.equal(verify('AB!', 'payeePaymentReference'), false);
      assert.equal(verify('Lf$', 'payeePaymentReference'), false);
      assert.equal(verify('j£u', 'payeePaymentReference'), false);
      assert.equal(verify('[huj]', 'payeePaymentReference'), false);
    });

    it('fails messages that are not strings', function () {
      assert.equal(verify(12351234, 'payeePaymentReference'), false);
      assert.equal(verify({ payeePaymentReference: 'ref' }, 'payeePaymentReference'), false);
      assert.equal(verify(['ref'], 'payeePaymentReference'), false);
      assert.equal(verify(true, 'payeePaymentReference'), false);
      assert.equal(verify(null, 'payeePaymentReference'), false);
      assert.equal(verify(undefined, 'payeePaymentReference'), false);
    });
  });

  describe('Personnummer verification...', function () {
    it('allows numbers of 10 or 12 numbers with hypen', function () {
      assert.equal(verify('8112189876', 'personNummer'), '198112189876');
      assert.equal(verify('870912-6760', 'personNummer'), '198709126760');
      assert.equal(verify('198909191788', 'personNummer'), '198909191788');
      assert.equal(verify('9902018879', 'personNummer'), '199902018879');
    });

    it('fails numbers that are older than 120 years', function () {
      assert.equal(verify('18730909-1572', 'personNummer'), false);
      assert.equal(verify('19000909-1572', 'personNummer'), false);
    });

    it('fails numbers with incorrect control digit', function () {
      assert.equal(verify('197608186687', 'personNummer'), false);
    });

    it('fails numbers that are incorrect length', function () {
      assert.equal(verify('18730909-157', 'personNummer'), false);
      assert.equal(verify('19000909-15726', 'personNummer'), false);
    });

    it('fails numbers with non numerals and hyphens', function () {
      assert.equal(verify('197212!18879', 'personNummer'), false);
      assert.equal(verify('197212AB8879', 'personNummer'), false);
      assert.equal(verify('19721211887$', 'personNummer'), false);
      assert.equal(verify('{}7212118879', 'personNummer'), false);
    });

    it('fails numbers that are not strings', function () {
      assert.equal(verify(198409147892, 'personNummer'), false);
      assert.equal(verify({ personNummer: '199301015578' }, 'personNummer'), false);
      assert.equal(verify(['199301015578'], 'personNummer'), false);
      assert.equal(verify(true, 'personNummer'), false);
      assert.equal(verify(null, 'personNummer'), false);
      assert.equal(verify(undefined, 'personNummer'), false);
    });
  });

  describe('Incorrect Verification Type', function () {
    it('fails on incorrect verification type', function () {
      assert.equal(verify('INCORRECT', 'notAType'), false);
      assert.equal(verify(1674638, 12542), false);
      assert.equal(verify('200', { type: 'amount' }), false);
    });
  });
});
