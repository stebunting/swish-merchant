const axios = require('axios');
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

  // Method to Create Payment Request
  createPaymentRequest(args = {}) {
    const endpoint = '/api/v2/paymentrequests/';
    const id = getSwishID();

    // User provided required values
    // Verify and assign amount
    const amount = verify(args.amount, 'amount');
    if (amount === false) {
      throw new SwishError(['PA02']);
    }

    // Verify and assign payer alias
    const payerAlias = verify(args.phoneNumber, 'payerAlias');
    if (payerAlias === false) {
      throw new SwishError(['VL10']);
    }

    // Verify and assign message (blank by default)
    const message = verify(args.message || '', 'message');
    if (message === false) {
      throw new SwishError(['VL11']);
    }

    // Create API configuration
    const config = {
      method: 'put',
      url: `${this.url}${endpoint}${id}`,
      httpsAgent: this.httpsAgent,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        callbackUrl: this.paymentRequestCallback,
        payeeAlias: this.payeeAlias,
        currency: 'SEK',
        amount,
        payerAlias,
        message
      }
    };

    // Verify and assign optional payee payment reference if applicable
    if (args.payeePaymentReference) {
      config.data.payeePaymentReference = verify(args.payeePaymentReference, 'payeePaymentReference');
      if (config.data.payeePaymentReference === false) {
        throw new SwishError(['VL13']);
      }
    }

    // Verify and assign optional person number
    if (args.personNummer) {
      config.data.payerSSN = verify(args.personNummer, 'personNummer');
      if (config.data.payerSSN === false) {
        throw new SwishError(['VL14']);
      }
    }

    // Verify and assign optional age limit
    if (args.ageLimit) {
      config.data.ageLimit = verify(args.ageLimit, 'ageLimit');
      if (config.data.ageLimit === false) {
        throw new SwishError(['VL12']);
      }
    }

    return new Promise((resolve, reject) => axios(config)
      .then((response) => {
        if (response.status !== 201) {
          throw SwishError(['X1']);
        }
        return resolve({
          success: true,
          id
        });
      })
      .catch((error) => {
        reject(new SwishError(error.response.data.map((x) => x.errorCode)));
      }));
  }

  // Method to Retrieve a Payment Request
  retrievePaymentRequest(args = {}) {
    const endpoint = '/api/v1/paymentrequests/';
    if (!args.id) {
      throw new SwishError(['VL15']);
    }
    const { id } = args;

    // Create API configuration
    const config = {
      method: 'get',
      url: `${this.url}${endpoint}${id}`,
      httpsAgent: this.httpsAgent
    };

    return new Promise((resolve, reject) => axios(config)
      .then((response) => {
        if (response.status !== 200) {
          throw SwishError(['X1']);
        }
        return resolve({
          success: true,
          data: response.data
        });
      })
      .catch((error) => {
        reject(new SwishError(error.response.data.map((x) => x.errorCode)));
      }));
  }

  createRefundRequest(args = {}) {
    const endpoint = '/api/v2/refunds/';
    const id = getSwishID();

    // User provided required values
    // Verify and assign amount
    const amount = verify(args.amount, 'amount');
    if (amount === false) {
      throw new SwishError(['PA02']);
    }

    // Verify and assign original payment reference
    const originalPaymentReference = verify(args.originalPaymentReference, 'uuid');
    if (originalPaymentReference === false) {
      throw new SwishError(['FF08']);
    }

    // Verify and assign message (blank by default)
    const message = verify(args.message || '', 'message');
    if (message === false) {
      throw new SwishError(['VL11']);
    }

    // Create API configuration
    const config = {
      method: 'put',
      url: `${this.url}${endpoint}${id}`,
      httpsAgent: this.httpsAgent,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        callbackUrl: this.paymentRequestCallback,
        payerAlias: this.payeeAlias,
        currency: 'SEK',
        amount,
        message,
        originalPaymentReference: args.originalPaymentReference
      }
    };

    return new Promise((resolve, reject) => axios(config)
      .then((response) => {
        if (response.status !== 201) {
          throw SwishError(['X1']);
        }
        return resolve({
          success: true,
          id
        });
      })
      .catch((error) => {
        reject(new SwishError(error.response.data.map((x) => x.errorCode)));
      }));
  }
}

module.exports = Swish;
