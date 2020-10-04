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

  describe('creates Refund Request and...', function () {
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
          amount: 200,
          originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF'
        };
      });

      it('with valid information', async function () {
        const response = await swish.createRefundRequest(requestPayload);
        assert(response.success);
      });
    });

    describe('fails...', function () {
      before('initiates class', function () {
        swish = new Swish(classPayload);
        assert(true);

        // Set URL to Simulator Testing URL
        swish.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
      });

      it('with invalid original payment reference', async function () {
        assert.throws(() => {
          swish.createRefundRequest({
            originalPaymentReference: 'INVALID',
            amount: '200'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'FF08',
            errorMessage: 'Payment Reference is invalid',
            additionalInformation: null
          }]
        });
      });

      it('with invalid original payment reference', async function () {
        assert.throws(() => {
          swish.createRefundRequest({
            originalPaymentReference: 'INVALID',
            amount: '200'
          });
        }, {
          name: 'SwishError',
          errors: [{
            errorCode: 'FF08',
            errorMessage: 'Payment Reference is invalid',
            additionalInformation: null
          }]
        });
      });

      it('with too high amount', async function () {
        assert.throws(() => {
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
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
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
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
          swish.createRefundRequest({
            originalPaymentReference: '1234567890ABCDEF1234567890ABCDEF',
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
    });
  });
});
