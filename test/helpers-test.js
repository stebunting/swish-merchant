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
      assert.equal(verify('1231231231', 'merchantAlias'), '1231231231');
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
});
