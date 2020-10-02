/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');

describe('Swish object construction', () => {
  describe('Constructor Tests', () => {
    it('throws error on invalid merchant alias', function () {
      let swish;
      assert.throws(() => {
        swish = new Swish({
          alias: 'INVALIDALIAS'
        });
      }, {
        errors: [{
          errorCode: '1',
          errorMessage: 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.',
          additionalInformation: null
        }]
      });
      assert.strictEqual(swish, undefined);
    });

    it('throws error on invalid payment request callback URL', function () {
      let swish;
      assert.throws(() => {
        swish = new Swish({
          alias: '1234567890',
          paymentRequestCallback: 'INVALIDCALLBACK'
        });
      }, {
        errors: [{
          errorCode: '2',
          errorMessage: 'Invalid Payment Request Callback URL. Must be a valid URL that uses https protocol.',
          additionalInformation: null
        }]
      });
      assert.strictEqual(swish, undefined);
    });

    it('reverts to default payment request callback on no entry', function () {
      let swish;
      swish = new Swish({ alias: '1234567890' });
      assert.strictEqual(swish.paymentRequestCallback, 'https://swish-callback.com/');

      swish = new Swish({
        alias: '1234567890',
        paymentRequestCallback: null
      });
      assert.strictEqual(swish.paymentRequestCallback, 'https://swish-callback.com/');

      swish = new Swish({
        alias: '1234567890',
        paymentRequestCallback: undefined
      });
      assert.strictEqual(swish.paymentRequestCallback, 'https://swish-callback.com/');
    });
  });
});
