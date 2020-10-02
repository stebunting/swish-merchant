/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');

describe('Swish Create Payment Integration Tests', () => {
  let swish;
  const classPayload = {
    alias: '1234679304',
    cert: 'test/private/test.pem',
    key: 'test/private/test.key',
    ca: 'test/private/test-ca.pem',
    password: 'swish'
  };
  const requestPayload = {
    phoneNumber: '4672242856',
    amount: 200,
    message: 'This is a message!',
    payeePaymentReference: '358792ABC',
    ageLimit: 16
  };

  describe('Create Payment Request call...', () => {
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

    it('throws on invalid CA', function () {
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
      swish = new Swish(classPayload);
      assert(true);

      // Set URL to Simulator Testing URL
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    });

    it('succeeds with valid information', async function () {
      const response = await swish.createPaymentRequest(requestPayload);
      assert(response.success);
      requestPayload.id = response.id;
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

    it('fails with invalid payment reference', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '07876879',
          amount: '200',
          message: 'FF08'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'FF08');
      }
    });

    it('fails with invalid callback URL', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '07876879',
          amount: '200',
          message: 'RP03'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'RP03');
      }
    });

    it('fails with invalid payer alias', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '07876879',
          amount: '200',
          message: 'BE18'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'BE18');
      }
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

    it('fails with invalid ageLimit', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '0722247583',
          amount: '100',
          ageLimit: 105
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.status, false);
        assert.equal(error.errors, 'Invalid Age Limit. Must be an integer between 1 and 99.');
      }
    });
  });

  describe('Retrieve Payment Request call...', function () {
    it('succeeds with valid payload', async function () {
      const response = await swish.retrievePaymentRequest({
        id: requestPayload.id
      });
      assert(response.success);
      assert.equal(response.data.id, requestPayload.id);
      assert.equal(response.data.payerAlias, requestPayload.phoneNumber);
      assert.equal(response.data.payeeAlias, classPayload.alias);
      assert.equal(response.data.amount, requestPayload.amount);
      assert.equal(response.data.message, requestPayload.message);
      assert.equal(response.data.payeePaymentReference, requestPayload.payeePaymentReference);
      assert.equal(response.data.currency, 'SEK');
      assert.equal(response.data.status, 'CREATED');
      assert.equal(response.data.callbackUrl, swish.paymentRequestCallback);
      assert.equal(response.data.datePaid, null);
      assert.equal(response.data.errorCode, null);
      assert.equal(response.data.errorMessage, null);
      requestPayload.paymentReference = response.data.paymentReference;
    });

    it('fails with missing id', async function () {
      try {
        await swish.retrievePaymentRequest();
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'Error');
        assert.equal(error.message, 'ID must be supplied to receive payment request.');
      }
    });

    it('fails with invalid id', async function () {
      try {
        await swish.retrievePaymentRequest({
          id: 'INVALIDID'
        });
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'RP04');
      }
    });
  });
});
