// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');
const stringCerts = require('./private/testStrings.js');

describe('Swish Class Constructor...', () => {
  let swish;
  function resetSwishObject() {
    swish = undefined;
  }

  describe('constructs Swish object and...', () => {
    describe('succeeds...', () => {
      afterEach('reset swish object', resetSwishObject);

      it('with default payment request callback', () => {
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

      it('with string certificates', async () => {
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
        assert.strictEqual(typeof response.id, 'string');
        assert(response.id.length > 0);
      });
    });

    describe('throws SwishError on...', () => {
      afterEach('reset swish object', resetSwishObject);

      it('invalid certificate', () => {
        swish = new Swish({
          alias: '1234567890'
        });
        assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0737768698',
            amount: 250
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'X2',
              errorMessage: 'Could not connect to Swish Server, check certificates.',
              additionalInformation: null
            }]
          }
        );
      });

      it('missing alias', () => {
        assert.throws(() => {
          swish = new Swish();
        }, {
          errors: [{
            errorCode: 'RP01',
            errorMessage: 'Missing Merchant Swish Number.',
            additionalInformation: null
          }]
        });
        assert.strictEqual(swish, undefined);
      });

      it('invalid merchant alias', () => {
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

      it('invalid payment request callback URL', () => {
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

      it('invalid certificate', () => {
        assert.throws(() => {
          swish = new Swish({
            alias: '1234679304',
            cert: 'invalid/path/to/cert'
          });
        }, {
          errors: [{
            errorCode: 'VL03',
            errorMessage: 'Invalid Certificate.',
            additionalInformation: null
          }]
        });
        assert.strictEqual(swish, undefined);
      });

      it('invalid key', () => {
        assert.throws(() => {
          swish = new Swish({
            alias: '1234679304',
            key: 'invalid/path/to/key'
          });
        }, {
          errors: [{
            errorCode: 'VL04',
            errorMessage: 'Invalid Key.',
            additionalInformation: null
          }]
        });
        assert.strictEqual(swish, undefined);
      });

      it('invalid CA', () => {
        assert.throws(() => {
          swish = new Swish({
            alias: '1234679304',
            ca: 'invalid/path/to/ca'
          });
        }, {
          errors: [{
            errorCode: 'VL05',
            errorMessage: 'Invalid CA.',
            additionalInformation: null
          }]
        });
        assert.strictEqual(swish, undefined);
      });
    });
  });
});
