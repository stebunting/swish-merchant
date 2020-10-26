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

  function initiateClass() {
    swish = new Swish(classPayload);
    assert(true);

    // Set URL to Simulator Testing URL
    swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
  }

  let requestPayload;
  let validTransactionId;
  function initialisePayload() {
    requestPayload = {
      amount: 200,
      originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
      message: 'This is a refund',
      payerPaymentReference: 'payerRef'
    };
  }

  describe('creates Refund Request and...', () => {
    beforeEach('initiates class', initiateClass);

    describe('succeeds...', () => {
      beforeEach('initialise payload', initialisePayload);

      it('with valid information', async () => {
        const response = await swish.createRefundRequest(requestPayload);
        assert(response.success);
        validTransactionId = response.id;
      });
    });

    describe('fails (bypassing local checks)...', () => {
      beforeEach('initialise payload', initialisePayload);

      it('with invalid payer alias', async () => {
        requestPayload.message = 'FF08';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'FF08',
              errorMessage: 'Payment Reference is invalid',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid amount', async () => {
        requestPayload.message = 'PA02';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'PA02',
              errorMessage: 'Amount value is missing or not a valid number.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with insufficent funds', async () => {
        requestPayload.message = 'AM04';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'AM04',
              errorMessage: 'Insufficient funds in account.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with payment not found', async () => {
        requestPayload.message = 'RF02';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF02',
              errorMessage: 'Unexpected Error',
              additionalInformation: null
            }]
          }
        );
      });

      it('with unmatched payer alias', async () => {
        requestPayload.message = 'RF03';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF03',
              errorMessage: 'Payer alias in the refund does not match the payee alias in the original payment.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with unmatched payer organization number', async () => {
        requestPayload.message = 'RF04';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF04',
              errorMessage: 'Payer organization number do not match original payment payee organization number.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with unmatched SSN', async () => {
        requestPayload.message = 'RF06';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF06',
              errorMessage: 'The Payer SSN in the original payment is not the same as the SSN for the current Payee.',
              additionalInformation: null
            }]
          }
        );
      });

      it.skip('with declined transaction', async () => {
        requestPayload.message = 'RF07';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF07',
              errorMessage: 'Transaction declined.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with too large value', async () => {
        requestPayload.message = 'RF08';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF08',
              errorMessage: 'Amount value is too large, or amount exceeds the amount of the original payment minus any previous refunds.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with refund already in process', async () => {
        requestPayload.message = 'RF09';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RF09',
              errorMessage: 'Refund already in progress.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with instruction UUID not available', async () => {
        requestPayload.message = 'RP09';
        await assert.rejects(
          swish.createRefundRequest(requestPayload), {
            name: 'SwishError',
            errors: [{
              errorCode: 'RP09',
              errorMessage: 'InstructionUUID not available.',
              additionalInformation: null
            }]
          }
        );
      });
    });

    describe('fails...', () => {
      beforeEach('initialise payload', initialisePayload);

      it('with invalid original payment reference', async () => {
        assert.rejects(
          swish.createRefundRequest({
            originalPaymentReference: 'INVALID',
            amount: '200'
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

      it('with invalid original payment reference', async () => {
        assert.rejects(
          swish.createRefundRequest({
            originalPaymentReference: 'INVALID',
            amount: '200'
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

      it('with too high amount', async () => {
        assert.rejects(
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
            amount: '1000000000000'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'PA02',
              errorMessage: 'Amount value is missing or not a valid number.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid amount', async () => {
        assert.rejects(
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
            amount: '0.001'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'PA02',
              errorMessage: 'Amount value is missing or not a valid number.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid message', async () => {
        assert.rejects(
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
            amount: '100',
            message: '[INVALIDMESSAGE]'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'VL11',
              errorMessage: 'Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.',
              additionalInformation: null
            }]
          }
        );
      });

      it('with invalid payerPaymentReference', async () => {
        assert.rejects(
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
            amount: '100',
            payerPaymentReference: '[INVALIDMESSAGE]'
          }), {
            name: 'SwishError',
            errors: [{
              errorCode: 'VL13',
              errorMessage: 'Invalid Payee/Payer Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.',
              additionalInformation: null
            }]
          }
        );
      });
    });
  });

  describe('retrieves Refund Request and...', () => {
    beforeEach('initiates class', initiateClass);

    describe('succeeds...', () => {
      beforeEach('initialise payload', initialisePayload);

      it('with valid payload', async () => {
        const response = await swish.retrieveRefundRequest({
          id: validTransactionId
        });
        assert(response.success);
        assert.strictEqual(response.data.id, validTransactionId);
        assert.strictEqual(response.data.payerAlias, classPayload.alias);
        assert.strictEqual(response.data.amount, requestPayload.amount);
        assert.strictEqual(response.data.message, requestPayload.message);
        assert.strictEqual(
          response.data.payeePaymentReference,
          requestPayload.payeePaymentReference
        );
        assert.strictEqual(response.data.currency, 'SEK');
        assert.strictEqual(typeof response.data.status, 'string');
        assert.strictEqual(response.data.callbackUrl, swish.paymentRequestCallback);
        assert.strictEqual(typeof response.data.datePaid, 'object');
        assert.strictEqual(response.data.errorCode, null);
        assert.strictEqual(response.data.errorMessage, null);
        requestPayload.paymentReference = response.data.paymentReference;
      });
    });

    describe('fails...', () => {
      it('with missing id', () => {
        assert.rejects(swish.retrieveRefundRequest(), {
          name: 'SwishError',
          errors: [{
            errorCode: 'VL15',
            errorMessage: 'ID must be supplied to receive payment/refund request.',
            additionalInformation: null
          }]
        });
      });

      it('with invalid id', () => {
        assert.rejects(
          swish.retrieveRefundRequest({
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
});
