/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');

describe('Create Payment Request Integration', () => {
  describe('Payment Request call...', () => {
    let swish;

    it('throws on invalid alias', function () {
      try {
        const response = new Swish({ alias: '12346793041' });
        assert.equal(response.success, false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.');
      }
    });

    it('throws on missing alias', function () {
      try {
        const response = new Swish();
        assert.equal(response.success, false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Alias Required.');
      }
    });

    it('throws on invalid certificate', function () {
      try {
        const response = new Swish({
          alias: '1234679304',
          cert: 'invalid/path/to/cert'
        });
        assert.equal(response.success, false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Certificate.');
      }
    });

    it('throws on invalid key', function () {
      try {
        const response = new Swish({
          alias: '1234679304',
          key: 'invalid/path/to/key'
        });
        assert.equal(response.success, false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Key.');
      }
    });

    it('throws on invalid ca', function () {
      try {
        const response = new Swish({
          alias: '1234679304',
          ca: 'invalid/path/to/key'
        });
        assert.equal(response.success, false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid CA.');
      }
    });

    it('initiates class', function () {
      swish = new Swish({
        alias: '1234679304',
        cert: 'test/private/test.pem',
        key: 'test/private/test.key',
        ca: 'test/private/test-ca.pem',
        password: 'swish'
      });
      assert(true);

      // Set URL to Simulator Testing URL
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    });

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

    it('succeeds with valid payeePaymentReference', async function () {
      const response = await swish.createPaymentRequest({
        phoneNumber: '0738792',
        amount: '1',
        payeePaymentReference: '0175837AIN'
      });
      assert(response.success);
    });

    it('succeeds with valid personNummer', async function () {
      const response = await swish.createPaymentRequest({
        phoneNumber: '0738792',
        amount: '1',
        personNummer: '870912-6760'
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

    it('fails with invalid payeePaymentReference', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0722247583',
          amount: '100',
          payeePaymentReference: '[INVALIDMESSAGE]'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Payee Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.');
      }
    });

    it('fails with invalid personNummer', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0722247583',
          amount: '100',
          personNummer: '[INVALIDMESSAGE]'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'Invalid Person Nummer. Must be 10 or 12 digits and a valid Swedish Personnummer or Sammordningsnummer.');
      }
    });
  });
});
