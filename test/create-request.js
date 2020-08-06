/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');

describe('Create Payment Request Integration', () => {
  describe('Payment Request call...', () => {
    const swish = new Swish({
      alias: '1234679304',
      cert: 'test/cert/test.pem',
      key: 'test/cert/test.key',
      ca: 'test/cert/test-ca.pem',
      password: 'swish'
    });

    // Set URL to Simulator Testing URL
    swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';

    it('succeeds with valid information', async function () {
      const response = await swish.createPaymentRequest({
        payerAlias: '4672242856',
        amount: '200'
      });
      assert(response.success);
    });

    it('fails with invalid payer alias', async function () {
      try {
        await swish.createPaymentRequest({
          payerAlias: '4672242856234324234',
          amount: '200'
        });
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'BE18');
      }
    });

    it('fails with amount too high', async function () {
      try {
        await swish.createPaymentRequest({
          payerAlias: '46722247583',
          amount: '1000000000000'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'AM02');
      }
    });

    it('fails with invalid amount', async function () {
      try {
        await swish.createPaymentRequest({
          payerAlias: '46722247583',
          amount: '0.001'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'PA02');
      }
    });
  });
});
