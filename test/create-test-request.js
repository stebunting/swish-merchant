/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');

describe('Swish Class Unit Tests', () => {
  const classPayload = {
    alias: '1234679304',
    cert: 'test/private/test.pem',
    key: 'test/private/test.key',
    ca: 'test/private/test-ca.pem',
    password: 'swish'
  };

  describe('Creating Swish Object throws SwishError...', () => {
    it('on missing alias', function () {
      try {
        const response = new Swish();
        assert.strictEqual(response.success, false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL01');
        assert.strictEqual(error.errors[0].errorMessage, 'Alias Required.');
      }
    });

    it('on invalid alias', function () {
      try {
        const response = new Swish({ alias: '12346793041' });
        assert.strictEqual(response.success, false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL02');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.');
      }
    });

    it('on invalid certificate', function () {
      try {
        const response = new Swish({
          alias: '1234679304',
          cert: 'invalid/path/to/cert'
        });
        assert.strictEqual(response.success, false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL03');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Certificate.');
      }
    });

    it('on invalid key', function () {
      try {
        const response = new Swish({
          alias: '1234679304',
          key: 'invalid/path/to/key'
        });
        assert.strictEqual(response.success, false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL04');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Key.');
      }
    });

    it('on invalid CA', function () {
      try {
        const response = new Swish({
          alias: '1234679304',
          ca: 'invalid/path/to/key'
        });
        assert.strictEqual(response.success, false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL05');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid CA.');
      }
    });
  });

  describe('Create Payment Request call...', () => {
    let swish;
    let requestPayload;

    before('initiates class', function () {
      swish = new Swish(classPayload);
      assert(true);

      // Set URL to Simulator Testing URL
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    });

    beforeEach('initialise payload', function () {
      requestPayload = {
        phoneNumber: '4672242856',
        amount: 200,
        message: 'This is a message!',
        payeePaymentReference: '358792ABC',
        ageLimit: 16
      };
    });

    it('succeeds with valid information', async function () {
      const response = await swish.createPaymentRequest(requestPayload);
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

    it('fails with invalid payment reference', async function () {
      try {
        await swish.createPaymentRequest({
          phoneNumber: '07876879',
          amount: '200',
          message: 'FF08'
        });
        assert(false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'FF08');
        assert.strictEqual(error.errors[0].errorMessage, 'Payment Reference is invalid');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'RP03');
        assert.strictEqual(error.errors[0].errorMessage, 'Callback URL is missing or does not use HTTPS');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'BE18');
        assert.strictEqual(error.errors[0].errorMessage, 'Payer alias is invalid');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL10');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'PA02');
        assert.strictEqual(error.errors[0].errorMessage, 'Amount value is missing or not a valid number.');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'PA02');
        assert.strictEqual(error.errors[0].errorMessage, 'Amount value is missing or not a valid number.');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL11');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL13');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Payee Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL14');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Person Nummer. Must be 10 or 12 digits and a valid Swedish Personnummer or Sammordningsnummer.');
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
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL12');
        assert.strictEqual(error.errors[0].errorMessage, 'Invalid Age Limit. Must be an integer between 1 and 99.');
      }
    });
  });

  describe('Retrieve Payment Request call...', function () {
    let swish;
    let requestPayload;
    const transactionId = '41BA2B7B71A1456EA7A9676F0C18F39B';

    before('initiates class', function () {
      swish = new Swish(classPayload);
      assert(true);

      // Set URL to Simulator Testing URL
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    });

    beforeEach('initialise payload', function () {
      requestPayload = {
        phoneNumber: '4672242856',
        amount: 200,
        message: 'This is a message!',
        payeePaymentReference: '358792ABC',
        ageLimit: 16
      };
    });

    it('succeeds with valid payload', async function () {
      const response = await swish.retrievePaymentRequest({
        id: transactionId
      });
      assert(response.success);
      assert.strictEqual(response.data.id, transactionId);
      assert.strictEqual(response.data.payerAlias, requestPayload.phoneNumber);
      assert.strictEqual(response.data.payeeAlias, classPayload.alias);
      assert.strictEqual(response.data.amount, requestPayload.amount);
      assert.strictEqual(response.data.message, requestPayload.message);
      assert.strictEqual(response.data.payeePaymentReference, requestPayload.payeePaymentReference);
      assert.strictEqual(response.data.currency, 'SEK');
      assert.strictEqual(response.data.status, 'PAID');
      assert.strictEqual(response.data.callbackUrl, swish.paymentRequestCallback);
      assert.strictEqual(response.data.datePaid, '2020-10-03T07:10:54.372Z');
      assert.strictEqual(response.data.errorCode, null);
      assert.strictEqual(response.data.errorMessage, null);
      requestPayload.paymentReference = response.data.paymentReference;
    });

    it('fails with missing id', async function () {
      try {
        await swish.retrievePaymentRequest();
        assert(false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'VL15');
        assert.strictEqual(error.errors[0].errorMessage, 'ID must be supplied to receive payment request.');
      }
    });

    it('fails with invalid id', async function () {
      try {
        await swish.retrievePaymentRequest({
          id: 'INVALIDID'
        });
        assert(false);
      } catch (error) {
        assert.strictEqual(error.name, 'SwishError');
        assert.strictEqual(error.errors.length, 1);
        assert.strictEqual(error.errors[0].errorCode, 'RP04');
        assert.strictEqual(error.errors[0].errorMessage, 'No payment request found related to a token');
      }
    });
  });

  describe('Integration Test', () => {
    let swish;
    let requestPayload;

    before('initiates class', function () {
      swish = new Swish(classPayload);
      assert(true);

      // Set URL to Simulator Testing URL
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    });

    beforeEach('initialise payload', function () {
      requestPayload = {
        phoneNumber: '46733887459',
        amount: 950,
        message: 'Integration Message',
        payeePaymentReference: 'A674BC09',
        ageLimit: 22
      };
    });

    it('Creates and retrieves request', async function () {
      const postRes = await swish.createPaymentRequest(requestPayload);
      const getRes = await swish.retrievePaymentRequest({
        id: postRes.id
      });
      assert(getRes.success);
      assert.strictEqual(getRes.data.id, postRes.id);
      assert.strictEqual(getRes.data.payerAlias, requestPayload.phoneNumber);
      assert.strictEqual(getRes.data.payeeAlias, classPayload.alias);
      assert.strictEqual(getRes.data.amount, requestPayload.amount);
      assert.strictEqual(getRes.data.message, requestPayload.message);
      assert.strictEqual(getRes.data.payeePaymentReference, requestPayload.payeePaymentReference);
      assert.strictEqual(getRes.data.currency, 'SEK');
      assert.strictEqual(getRes.data.status, 'CREATED');
      assert.strictEqual(getRes.data.callbackUrl, swish.paymentRequestCallback);
      assert.strictEqual(getRes.data.datePaid, null);
      assert.strictEqual(getRes.data.errorCode, null);
      assert.strictEqual(getRes.data.errorMessage, null);
    });
  });
});
