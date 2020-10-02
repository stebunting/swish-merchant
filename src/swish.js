const axios = require('axios');
const fs = require('fs');
const https = require('https');
const SwishError = require('./swish-error');
const { getSwishID, verify } = require('./helpers');

class Swish {
  // Initiate Swish
  constructor(args = {}) {
    const defaultCallback = 'https://swish-callback.com/';
    this.url = 'https://cpc.getswish.net/swish-cpcapi';

    // Verify and assign payee alias
    if (!args.alias) {
      throw new SwishError('0');
    }
    const verifyMerchantAlias = verify(args.alias, 'merchantAlias');
    if (verifyMerchantAlias) {
      this.payeeAlias = verifyMerchantAlias;
    } else {
      throw new SwishError('1');
    }

    // Verify and assign payment request callback URL
    this.paymentRequestCallback = args.paymentRequestCallback || defaultCallback;
    const verifyCallbackUrl = verify(this.paymentRequestCallback, 'callbackUrl');
    if (verifyCallbackUrl) {
      this.paymentRequestCallback = verifyCallbackUrl;
    } else {
      throw new SwishError('2');
    }

    const payload = {};
    // Get certificate file
    if (args.cert) {
      try {
        payload.cert = fs.readFileSync(args.cert);
      } catch (error) {
        throw new SwishError('3');
      }
    }

    // Get key file
    if (args.key) {
      try {
        payload.key = fs.readFileSync(args.key);
      } catch (error) {
        throw new SwishError('4');
      }
    }

    // Get CA file
    if (args.ca) {
      try {
        payload.ca = fs.readFileSync(args.ca);
      } catch (error) {
        throw new SwishError('5');
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
      throw new SwishError('6');
    }

    // Verify and assign payer alias
    const payerAlias = verify(args.phoneNumber, 'payerAlias');
    if (payerAlias === false) {
      throw new SwishError('7');
    }

    // Verify and assign message (blank by default)
    const message = verify(args.message || '', 'message');
    if (message === false) {
      throw new SwishError('8');
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
        throw new SwishError('10');
      }
    }

    // Verify and assign optional person number
    if (args.personNummer) {
      config.data.payerSSN = verify(args.personNummer, 'personNummer');
      if (config.data.payerSSN === false) {
        throw new SwishError('11');
      }
    }

    // Verify and assign optional age limit
    if (args.ageLimit) {
      config.data.ageLimit = verify(args.ageLimit, 'ageLimit');
      if (config.data.ageLimit === false) {
        throw new SwishError('9');
      }
    }

    return new Promise((resolve, reject) => axios(config)
      .then((response) => {
        if (response.status !== 201) {
          throw SwishError('12');
        }
        return resolve({
          success: true,
          id
        });
      })
      .catch((error) => {
        reject(new SwishError(error.response.data[0].errorCode));
      }));
  }

  // Method to Retrieve a Payment Request
  retrievePaymentRequest(args = {}) {
    const endpoint = '/api/v1/paymentrequests/';
    if (!args.id) {
      throw new SwishError('13');
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
          throw SwishError('14');
        }
        return resolve({
          success: true,
          data: response.data
        });
      })
      .catch((error) => {
        reject(new SwishError(error.response.data[0].errorCode));
      }));
  }
}

module.exports = Swish;
