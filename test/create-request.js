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
        phoneNumber: '072242856',
        amount: '200'
      });
      assert(response.success);
    });

    it('succeeds with valid message', async function () {
      const response = await swish.createPaymentRequest({
        phoneNumber: '0738792',
        amount: '1',
        message: 'För Åsa, (25)'
      });
      assert(response.success);
    });

    it('fails with invalid payer alias', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0787',
          amount: '200'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.');
      }
    });

    it('fails with amount too high', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0722247583',
          amount: '1000000000000'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Amount. Must be a valid amount between 1 and 999999999999.99 SEK.');
      }
    });

    it('fails with invalid amount', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0722247583',
          amount: '0.001'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Amount. Must be a valid amount between 1 and 999999999999.99 SEK.');
      }
    });

    it('fails with invalid message', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0722247583',
          amount: '100',
          message: '[INVALIDMESSAGE]'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.');
      }
    });
  });
});
