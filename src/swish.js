const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const SwishError = require('./swishError');
const { getSwishID, verify } = require('./helpers');

class Swish {
  // Initiate Swish
  constructor(userArgs = {}) {
    const args = userArgs;
    const defaultCallback = 'https://swish-callback.com/';
    this.url = 'https://cpc.getswish.net/swish-cpcapi';

    // Verify and assign payee alias
    if (!args.alias) {
      throw new SwishError(['RP01']);
    }
    const verifyMerchantAlias = verify(args.alias, 'merchantAlias');
    if (verifyMerchantAlias) {
      this.payeeAlias = verifyMerchantAlias;
    } else {
      throw new SwishError(['VL02']);
    }

    // Verify and assign payment request callback URL
    this.paymentRequestCallback = args.paymentRequestCallback || defaultCallback;
    const verifyPaymentCallbackUrl = verify(this.paymentRequestCallback, 'callbackUrl');
    if (verifyPaymentCallbackUrl) {
      this.paymentRequestCallback = verifyPaymentCallbackUrl;
    } else {
      throw new SwishError(['RP03']);
    }

    // Verify and assign refund request callback URL
    this.refundRequestCallback = args.refundRequestCallback || defaultCallback;
    const verifyRefundCallbackUrl = verify(this.refundRequestCallback, 'callbackUrl');
    if (verifyRefundCallbackUrl) {
      this.refundRequestCallback = verifyRefundCallbackUrl;
    } else {
      throw new SwishError(['RP03']);
    }

    const payload = {};
    const options = [
      { type: 'cert', errorCode: 'VL03' },
      { type: 'key', errorCode: 'VL04' },
      { type: 'ca', errorCode: 'VL05' }
    ];

    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];

      if (args[option.type]) {
        if (args[option.type].length >= 1264) {
          payload[option.type] = args[option.type];
        } else {
          try {
            payload[option.type] = fs.readFileSync(args[option.type]);
          } catch (error) {
            throw new SwishError([option.errorCode]);
          }
        }
      }
    }

    payload.passphrase = args.password || '';
    this.httpsAgent = new https.Agent(payload);

    if (args.test === true) {
      this.url = 'https://mss.cpc.getswish.net/swish-cpcapi';
    }
  }

  // Generic put call
  createPutCall(endpoint, body) {
    const id = getSwishID();

    const config = {
      method: 'put',
      agent: this.httpsAgent,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };

    return new Promise((resolve, reject) => (
      fetch(`${this.url}${endpoint}${id}`, config)
        .then((response) => {
          if (response.status === 201) {
            return resolve({
              success: true,
              id
            });
          }
          return response.json();
        })
        .then((data) => {
          if (data != null) {
            return reject(new SwishError(data.map((error) => error.errorCode)));
          }
          return reject(new SwishError(['X1']));
        })
        .catch(() => reject(new SwishError(['X2'])))
    ));
  }

  // Generic get call
  createGetCall(endpoint, id) {
    return new Promise((resolve, reject) => (
      fetch(`${this.url}${endpoint}${id}`, { agent: this.httpsAgent })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            return reject(new SwishError(data.map((error) => error.errorCode)));
          }
          return resolve({
            success: true,
            data
          });
        })
        .catch(() => reject(new SwishError(['X2'])))
    ));
  }

  // Method to Create Payment Request
  createPaymentRequest(userArgs = {}) {
    const args = userArgs;
    const endpoint = '/api/v2/paymentrequests/';
    const body = {
      callbackUrl: this.paymentRequestCallback,
      payeeAlias: this.payeeAlias,
      currency: 'SEK'
    };

    args.message = args.message || '';
    const options = [
      {
        type: 'amount',
        errorCode: 'PA02',
        required: true
      }, {
        type: 'payerAlias',
        argsName: 'phoneNumber',
        errorCode: 'VL10',
        required: true
      }, {
        type: 'message',
        errorCode: 'VL11',
        required: true
      }, {
        type: 'payeePaymentReference',
        errorCode: 'VL13'
      }, {
        type: 'personNummer',
        swishName: 'payerSSN',
        errorCode: 'VL14'
      }, {
        type: 'ageLimit',
        errorCode: 'VL12'
      }
    ];

    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];

      if (!option.argsName) option.argsName = option.type;
      if (!option.swishName) option.swishName = option.type;

      if (option.required || args[option.argsName]) {
        body[option.swishName] = verify(args[option.argsName], option.type);
        if (body[option.swishName] === false) {
          return new Promise((_resolve, reject) => (
            reject(new SwishError([option.errorCode]))
          ));
        }
      }
    }

    return this.createPutCall(endpoint, body).then((response) => response);
  }

  // Method to Retrieve a Payment Request
  retrievePaymentRequest(userArgs = {}) {
    const args = userArgs;
    const endpoint = '/api/v1/paymentrequests/';
    if (!args.id) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['VL15']))
      ));
    }
    return this.createGetCall(endpoint, args.id);
  }

  // Method to create a refund request
  createRefundRequest(userArgs = {}) {
    const args = userArgs;
    const endpoint = '/api/v2/refunds/';
    const body = {
      callbackUrl: this.refundRequestCallback,
      payerAlias: this.payeeAlias,
      currency: 'SEK'
    };

    args.message = args.message || '';
    const options = [{
      type: 'amount',
      errorCode: 'PA02',
      required: true
    }, {
      type: 'uuid',
      argsName: 'originalPaymentReference',
      swishName: 'originalPaymentReference',
      errorCode: 'FF08',
      required: true
    }, {
      type: 'message',
      errorCode: 'VL11',
      required: true
    }, {
      type: 'payeePaymentReference',
      argsName: 'payerPaymentReference',
      swishName: 'payerPaymentReference',
      errorCode: 'VL13'
    }];

    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];

      if (!option.argsName) option.argsName = option.type;
      if (!option.swishName) option.swishName = option.type;

      if (option.required || args[option.argsName]) {
        body[option.swishName] = verify(args[option.argsName], option.type);
        if (body[option.swishName] === false) {
          return new Promise((_resolve, reject) => (
            reject(new SwishError([option.errorCode]))
          ));
        }
      }
    }

    return this.createPutCall(endpoint, body).then((response) => response);
  }

  // Method to Retrieve a Refund Request
  retrieveRefundRequest(userArgs = {}) {
    const args = userArgs;
    const endpoint = '/api/v1/refunds/';
    if (!args.id) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['VL15']))
      ));
    }
    return this.createGetCall(endpoint, args.id);
  }
}

module.exports = Swish;
