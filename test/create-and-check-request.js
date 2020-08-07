/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
// Requirements
const assert = require('assert').strict;
const Swish = require('../src/swish');
const user = require('./private/credentials');

describe('Create Payment Request Integration', () => {
  describe('Payment Request call...', () => {
    let swish;
    let paymentRequestId;

    it('creates Swish object', function () {
      swish = new Swish({
        alias: user.alias,
        cert: 'test/private/prod.pem',
        key: 'test/private/prod.key'
      });
    });

    it('creates payment request', async function () {
      const response = await swish.createPaymentRequest({
        phoneNumber: user.phoneNumber,
        amount: 200,
        message: 'Test Message!',
        payeePaymentReference: '013678923A',
        personNummer: user.personNummer
      });
      assert(response.success);
      assert.equal(response.id.length, 32);
      paymentRequestId = response.id;
    });
  });
});
