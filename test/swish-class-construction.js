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
        message: 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.'
      });
      assert.equal(swish, undefined);
    });

    it('throws error on invalid payment request callback URL', function () {
      let swish;
      assert.throws(() => {
        swish = new Swish({
          alias: '1234567890',
          paymentRequestCallback: 'INVALIDCALLBACK'
        });
      }, {
        message: 'Invalid Payment Request Callback URL. Must be a valid URL that uses https protocol.'
      });
      assert.equal(swish, undefined);
    });

    it('reverts to default payment request callback on no entry', function () {
      let swish;
      swish = new Swish({ alias: '1234567890' });
      assert.equal(swish.paymentRequestCallback, 'https://swish-callback.com/');

      swish = new Swish({
        alias: '1234567890',
        paymentRequestCallback: null
      });
      assert.equal(swish.paymentRequestCallback, 'https://swish-callback.com/');

      swish = new Swish({
        alias: '1234567890',
        paymentRequestCallback: undefined
      });
      assert.equal(swish.paymentRequestCallback, 'https://swish-callback.com/');
    });

    // it('throws error on missing certificate file', function () {
    //   let swish;
    //   assert.throws(() => {
    //     swish = new Swish({
    //       alias: '1234567890',
    //       cert: 'fakelocation'
    //     });
    //   }, {
    //     message: ''
    //   });
    //   assert.equal(swish, undefined);
    // });
  });
});
