/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');
const user = require('./private/credentials');

describe.skip('Payment Request call to live API...', () => {
  let swish;
  let payload;
  let transactionId;

  before('creates Swish object', function () {
    swish = new Swish({
      alias: user.alias,
      cert: 'test/private/prod.pem',
      key: 'test/private/prod.key'
    });
  });

  describe('fails...', function () {
    beforeEach('initialise payload', function () {
      payload = {
        phoneNumber: user.phoneNumber,
        amount: 200,
        message: 'Test Message!',
        payeePaymentReference: '013678923A',
        personNummer: user.personNummer,
        ageLimit: 16
      };
    });

    it('creating payment request for user younger than age limit', async function () {
      payload.ageLimit = 90;
      await assert.rejects(swish.createPaymentRequest(payload), {
        name: 'SwishError',
        errors: [{
          errorCode: 'VR01',
          errorMessage: 'Payer does not meet age limit.',
          additionalInformation: null
        }]
      });
    });
  });

  describe('succeeds...', function () {
    beforeEach('initialise payload', function () {
      payload = {
        phoneNumber: user.phoneNumber,
        amount: 200,
        message: 'Test Message!',
        payeePaymentReference: '013678923A',
        personNummer: user.personNummer,
        ageLimit: 16
      };
    });

    it('creating valid payment request', async function () {
      const response = await swish.createPaymentRequest(payload);
      assert(response.success);
      assert.strictEqual(response.id.length, 32);
      transactionId = response.id;
    });

    it('retrieving payment request', async function () {
      const response = await swish.retrievePaymentRequest({
        id: transactionId
      });
      assert(response.success);
      assert.strictEqual(response.data.id, transactionId);
      assert.strictEqual(response.data.payerAlias, payload.phoneNumber);
      assert.strictEqual(response.data.payeeAlias, user.alias);
      assert.strictEqual(response.data.amount, payload.amount);
      assert.strictEqual(response.data.message, payload.message);
      assert.strictEqual(response.data.payeePaymentReference, payload.payeePaymentReference);
      assert.strictEqual(response.data.currency, 'SEK');
      assert.strictEqual(response.data.status, 'CREATED');
      assert.strictEqual(response.data.callbackUrl, swish.paymentRequestCallback);
      assert.strictEqual(response.data.datePaid, null);
      assert.strictEqual(response.data.errorCode, null);
      assert.strictEqual(response.data.errorMessage, null);
    });
  });

  describe('fails...', function () {
    beforeEach('initialise payload', function () {
      payload = {
        phoneNumber: user.phoneNumber,
        amount: 200,
        message: 'Test Message!',
        payeePaymentReference: '013678923A',
        personNummer: user.personNummer,
        ageLimit: 16
      };
    });

    it('creating duplicate payment request', async function () {
      await assert.rejects(swish.createPaymentRequest(payload), {
        name: 'SwishError',
        errors: [{
          errorCode: 'RP06',
          errorMessage: 'A payment request already exists for that payer.',
          additionalInformation: null
        }]
      });
    });
  });
});

describe.skip('Create Refund Request Integration', () => {
  describe('Payment Request call...', () => {
    let swish;
    let payload;

    before('creates Swish object', function () {
      swish = new Swish({
        alias: user.alias,
        cert: 'test/private/prod.pem',
        key: 'test/private/prod.key'
      });
    });

    beforeEach('initialise payload', function () {
      payload = {
        payeePaymentReference: '1234INVALID',
        amount: 200
      };
    });

    it('throws error on invalid reference', async function () {
      assert.throws(() => {
        swish.createRefundRequest(payload);
      }, {
        name: 'SwishError',
        errors: [{
          errorCode: 'FF08',
          errorMessage: 'Payment Reference is invalid',
          additionalInformation: null
        }]
      });
    });
  });
});
