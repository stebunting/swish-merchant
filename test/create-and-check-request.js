/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');
// const user = require('./private/credentials');

describe.skip('Create Payment Request Integration', () => {
  describe('Payment Request call...', () => {
    let swish;
    const payload = {
      phoneNumber: user.phoneNumber,
      amount: 200,
      message: 'Test Message!',
      payeePaymentReference: '013678923A',
      personNummer: user.personNummer
    };

    it('creates Swish object', function () {
      swish = new Swish({
        alias: user.alias,
        cert: 'test/private/prod.pem',
        key: 'test/private/prod.key'
      });
    });

    it('creates payment request', async function () {
      const response = await swish.createPaymentRequest(payload);
      assert(response.success);
      assert.equal(response.id.length, 32);
      payload.id = response.id;
    });

    it('retrieves payment request', async function () {
      const response = await swish.retrievePaymentRequest({
        id: payload.id
      });
      assert(response.success);
      assert.equal(response.data.id, payload.id);
      assert.equal(response.data.payerAlias, payload.phoneNumber);
      assert.equal(response.data.payeeAlias, user.alias);
      assert.equal(response.data.amount, payload.amount);
      assert.equal(response.data.message, payload.message);
      assert.equal(response.data.payeePaymentReference, payload.payeePaymentReference);
      assert.equal(response.data.currency, 'SEK');
      assert.equal(response.data.status, 'CREATED');
      assert.equal(response.data.callbackUrl, swish.paymentRequestCallback);
      assert.equal(response.data.datePaid, null);
      assert.equal(response.data.errorCode, null);
      assert.equal(response.data.errorMessage, null);
    });

    it('fails to create duplicate payment request', async function () {
      try {
        await swish.createPaymentRequest(payload);
        assert(false);
      } catch (error) {
        assert.equal(error.name, 'SwishError');
        assert.equal(error.errors.length, 1);
        assert.equal(error.errors[0].errorCode, 'RP06');
      }
    });
  });
});
