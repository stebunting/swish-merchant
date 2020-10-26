const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const SwishError = require('./swishError');
const { getSwishID, verify } = require('./helpers');

class Swish {
  // Initiate Swish
  constructor(args = {}) {
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
    const verifyCallbackUrl = verify(this.paymentRequestCallback, 'callbackUrl');
    if (verifyCallbackUrl) {
      this.paymentRequestCallback = verifyCallbackUrl;
    } else {
      throw new SwishError(['RP03']);
    }

    const payload = {};
    // Get certificate file
    if (args.cert) {
      if (args.cert.length >= 1264) {
        payload.cert = args.cert;
      } else {
        try {
          payload.cert = fs.readFileSync(args.cert);
        } catch (error) {
          throw new SwishError(['VL03']);
        }
      }
    }

    // Get key file
    if (args.key) {
      if (args.key.length >= 1264) {
        payload.key = args.key;
      } else {
        try {
          payload.key = fs.readFileSync(args.key);
        } catch (error) {
          throw new SwishError(['VL04']);
        }
      }
    }

    // Get CA file
    if (args.ca) {
      if (args.ca.length >= 1264) {
        payload.ca = args.ca;
      } else {
        try {
          payload.ca = fs.readFileSync(args.ca);
        } catch (error) {
          throw new SwishError(['VL05']);
        }
      }
    }
    payload.passphrase = args.password || '';
    this.httpsAgent = new https.Agent(payload);
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
  createPaymentRequest(args = {}) {
    const endpoint = '/api/v2/paymentrequests/';
    const body = {
      callbackUrl: this.paymentRequestCallback,
      payeeAlias: this.payeeAlias,
      currency: 'SEK'
    };

    // User provided required values
    // Verify and assign amount
    body.amount = verify(args.amount, 'amount');
    if (body.amount === false) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['PA02']))
      ));
    }

    // Verify and assign payer alias
    body.payerAlias = verify(args.phoneNumber, 'payerAlias');
    if (body.payerAlias === false) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['VL10']))
      ));
    }

    // Verify and assign message (blank by default)
    body.message = verify(args.message || '', 'message');
    if (body.message === false) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['VL11']))
      ));
    }

    // Verify and assign optional payee payment reference if applicable
    if (args.payeePaymentReference) {
      body.payeePaymentReference = verify(args.payeePaymentReference, 'payeePaymentReference');
      if (body.payeePaymentReference === false) {
        return new Promise((_resolve, reject) => (
          reject(new SwishError(['VL13']))
        ));
      }
    }

    // Verify and assign optional person number
    if (args.personNummer) {
      body.payerSSN = verify(args.personNummer, 'personNummer');
      if (body.payerSSN === false) {
        return new Promise((_resolve, reject) => (
          reject(new SwishError(['VL14']))
        ));
      }
    }

    // Verify and assign optional age limit
    if (args.ageLimit) {
      body.ageLimit = verify(args.ageLimit, 'ageLimit');
      if (body.ageLimit === false) {
        return new Promise((_resolve, reject) => (
          reject(new SwishError(['VL12']))
        ));
      }
    }

    return this.createPutCall(endpoint, body).then((response) => response);
  }

  // Method to Retrieve a Payment Request
  retrievePaymentRequest(args = {}) {
    const endpoint = '/api/v1/paymentrequests/';
    if (!args.id) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['VL15']))
      ));
    }
    return this.createGetCall(endpoint, args.id);
  }

  // Method to create a refund request
  createRefundRequest(args = {}) {
    const endpoint = '/api/v2/refunds/';
    const body = {
      callbackUrl: this.paymentRequestCallback,
      payerAlias: this.payeeAlias,
      currency: 'SEK'
    };

    // User provided required values
    // Verify and assign amount
    body.amount = verify(args.amount, 'amount');
    if (body.amount === false) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['PA02']))
      ));
    }

    // Verify and assign original payment reference
    body.originalPaymentReference = verify(args.originalPaymentReference, 'uuid');
    if (body.originalPaymentReference === false) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['FF08']))
      ));
    }

    // Verify and assign message (blank by default)
    body.message = verify(args.message || '', 'message');
    if (body.message === false) {
      return new Promise((_resolve, reject) => (
        reject(new SwishError(['VL11']))
      ));
    }

    // Verify and assign optional payer payment reference if applicable
    if (args.payerPaymentReference) {
      body.payerPaymentReference = verify(args.payerPaymentReference, 'payeePaymentReference');
      if (body.payerPaymentReference === false) {
        return new Promise((_resolve, reject) => (
          reject(new SwishError(['VL13']))
        ));
      }
    }

    return this.createPutCall(endpoint, body).then((response) => response);
  }

  // Method to Retrieve a Refund Request
  retrieveRefundRequest(args = {}) {
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
