/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');
const stringCerts = require('./private/testStrings.js');

describe('Swish object construction', () => {
  let swish;

  beforeEach('reset swish', function () {
    swish = undefined;
  });

  describe('Constructor Tests', () => {
    it('throws error on invalid merchant alias', function () {
      assert.throws(() => {
        swish = new Swish({
          alias: 'INVALIDALIAS'
        });
      }, {
        errors: [{
          errorCode: 'VL02',
          errorMessage: 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.',
          additionalInformation: null
        }]
      });
      assert.strictEqual(swish, undefined);
    });

    it('throws error on invalid payment request callback URL', function () {
      assert.throws(() => {
        swish = new Swish({
          alias: '1234567890',
          paymentRequestCallback: 'INVALIDCALLBACK'
        });
      }, {
        errors: [{
          errorCode: 'RP03',
          errorMessage: 'Callback URL is missing or does not use HTTPS',
          additionalInformation: null
        }]
      });
      assert.strictEqual(swish, undefined);
    });

    it('reverts to default payment request callback on no entry', function () {
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

    it('constructs with string certs', async function () {
      swish = new Swish({
        alias: '1234567890',
        cert: stringCerts.cert,
        key: stringCerts.key,
        ca: stringCerts.ca,
        password: 'swish'
      });
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';

      const response = await swish.createPaymentRequest({
        phoneNumber: '0722667587',
        amount: 200
      });
      assert(response.success);
    });
  });
});
