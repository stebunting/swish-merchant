/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');

describe('Swish Class...', () => {
  let swish;
  const classPayload = {
    alias: '1234679304',
    cert: 'test/private/test.pem',
    key: 'test/private/test.key',
    ca: 'test/private/test-ca.pem',
    password: 'swish'
  };

  describe('creates Payment Request and...', function () {
    before('initiate class', function () {
      swish = new Swish(classPayload);
      assert(true);

      // Set URL to Simulator Testing URL
      swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    });

    describe('succeeds...', function () {
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

      it('with valid information', async function () {
        const response = await swish.createPaymentRequest(requestPayload);
        assert(response.success);
      });

      it('with valid message', async function () {
        const response = await swish.createPaymentRequest({
          phoneNumber: '0738792',
          amount: '1',
          message: 'För Åsa, (25)'
        });
        assert(response.success);
      });

      it('with valid payeePaymentReference', async function () {
        const response = await swish.createPaymentRequest({
          phoneNumber: '0738792',
          amount: '1',
          payeePaymentReference: '0175837AIN'
        });
        assert(response.success);
      });

      it('with valid personNummer', async function () {
        const response = await swish.createPaymentRequest({
          phoneNumber: '0738792',
          amount: '1',
          personNummer: '870912-6760'
        });
        assert(response.success);
      });
    });

    describe('fails (bypassing local checks)...', function () {
      it('with invalid payer alias', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '07876879',
            amount: '200',
            message: 'BE18'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'BE18',
              errorMessage: 'Payer alias is invalid',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid callback URL', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '07876879',
            amount: '200',
            message: 'RP03'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RP03',
              errorMessage: 'Callback URL is missing or does not use HTTPS',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid payment reference', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '07876879',
            amount: '200',
            message: 'FF08'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'FF08',
              errorMessage: 'Payment Reference is invalid',
              additionalInformation: null
            }]
          }
        );
      });

      it('with too high amount', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'AM02'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'AM02',
              errorMessage: 'Amount value is too large.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with too low amount', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'AM06'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'AM06',
              errorMessage: 'Specified transaction amount is less than agreed minimum.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid currency value', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'AM03'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'AM03',
              errorMessage: 'Invalid or missing Currency.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with badly formatted message', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'RP02'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RP02',
              errorMessage: 'Wrong formatted message.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with no payment request found related to token', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'RP04'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RP04',
              errorMessage: 'No payment request found related to a token',
              additionalInformation: null
            }]
          }
        );
      });

      it('with payment request already pending for payer', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'RP06'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RP06',
              errorMessage: 'A payment request already exists for that payer.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with counterpart not activated', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'ACMT01'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'ACMT01',
              errorMessage: 'Counterpart is not activated.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with payer not yet enrolled', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'ACMT03'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'ACMT03',
              errorMessage: 'Payer not Enrolled.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with payee not yet enrolled', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'ACMT07'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'ACMT07',
              errorMessage: 'Payee not Enrolled.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with payer who does not meet age limit', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'VR01'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'VR01',
              errorMessage: 'Payer does not meet age limit.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with payer who is not enrolled with ssn', async function () {
        await assert.rejects(
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: 'VR02'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'VR02',
              errorMessage: 'The payer alias in the request is not enroled in swish with the supplied ssn',
              additionalInformation: null
            }]
          }
        );
      });
    });

    describe('fails...', function () {
      it('with invalid payer alias', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0787',
            amount: '200'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL10',
            errorMessage: 'Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.',
            additionalInformation: null
          }]
        });
      });

      it('with too high amount', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '1000000000000'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'PA02',
            errorMessage: 'Amount value is missing or not a valid number.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid amount', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '0.001'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'PA02',
            errorMessage: 'Amount value is missing or not a valid number.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid message', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            message: '[INVALIDMESSAGE]'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL11',
            errorMessage: 'Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid payee payment reference', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            payeePaymentReference: '[INVALIDMESSAGE]'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL13',
            errorMessage: 'Invalid Payee Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid person nummer', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            personNummer: '[INVALIDPERSONNUMMER]'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL14',
            errorMessage: 'Invalid Person Nummer. Must be 10 or 12 digits and a valid Swedish Personnummer or Sammordningsnummer.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid age limit', async function () {
        assert.throws(() => {
          swish.createPaymentRequest({
            phoneNumber: '0722247583',
            amount: '100',
            ageLimit: 105
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL12',
            errorMessage: 'Invalid Age Limit. Must be an integer between 1 and 99.',
            additionalInformation: null
          }]
        });
      });
    });
  });

  describe('retrieves Payment Request and...', function () {
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

    describe('succeeds...', function () {
      it('with valid payload', async function () {
        const response = await swish.retrievePaymentRequest({
          id: transactionId
        });
        assert(response.success);
        assert.strictEqual(response.data.id, transactionId);
        assert.strictEqual(response.data.payerAlias, requestPayload.phoneNumber);
        assert.strictEqual(response.data.payeeAlias, classPayload.alias);
        assert.strictEqual(response.data.amount, requestPayload.amount);
        assert.strictEqual(response.data.message, requestPayload.message);
        assert.strictEqual(
          response.data.payeePaymentReference,
          requestPayload.payeePaymentReference
        );
        assert.strictEqual(response.data.currency, 'SEK');
        assert.strictEqual(response.data.status, 'PAID');
        assert.strictEqual(response.data.callbackUrl, swish.paymentRequestCallback);
        assert.strictEqual(response.data.datePaid, '2020-10-03T07:10:54.372Z');
        assert.strictEqual(response.data.errorCode, null);
        assert.strictEqual(response.data.errorMessage, null);
        requestPayload.paymentReference = response.data.paymentReference;
      });
    });

    describe('fails...', function () {
      it('with missing id', function () {
        assert.throws(() => {
          swish.retrievePaymentRequest();
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL15',
            errorMessage: 'ID must be supplied to receive payment request.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid id', async function () {
        assert.rejects(
          swish.retrievePaymentRequest({
            id: 'INVALIDID'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RP04',
              errorMessage: 'No payment request found related to a token',
              additionalInformation: null
            }]
          }
        );
      });
    });
  });

  describe('Integration Test', () => {
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
