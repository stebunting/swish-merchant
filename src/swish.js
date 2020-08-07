const axios = require('axios');
const fs = require('fs');
const https = require('https');
const SwishError = require('./swish-error');
const { getSwishID, verify } = require('./helpers');

class Swish {
  constructor(args = {}) {
    const defaultCallback = 'https://swish-callback.com/';
    this.url = 'https://cpc.getswish.net/swish-cpcapi';

    // Verify and assign payee alias
    if (!args.alias) {
      throw new Error('Alias Required.');
    }
    const verifyMerchantAlias = verify(args.alias, 'merchantAlias');
    if (verifyMerchantAlias) {
      this.payeeAlias = verifyMerchantAlias;
    } else {
      throw new Error('Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.');
    }

    // Verify and assign payment request callback URL
    this.paymentRequestCallback = args.paymentRequestCallback || defaultCallback;
    const verifyCallbackUrl = verify(this.paymentRequestCallback, 'callbackUrl');
    if (verifyCallbackUrl) {
      this.paymentRequestCallback = verifyCallbackUrl;
    } else {
      throw new Error('Invalid Payment Request Callback URL. Must be a valid URL that uses https protocol.');
    }

    const payload = {};
    // Get certificate file
    if (args.cert) {
      try {
        payload.cert = fs.readFileSync(args.cert);
      } catch (error) {
        throw Error('Invalid Certificate.');
      }
    }

    // Get key file
    if (args.key) {
      try {
        payload.key = fs.readFileSync(args.key);
      } catch (error) {
        throw Error('Invalid Key.');
      }
    }

    // Get CA file
    if (args.ca) {
      try {
        payload.ca = fs.readFileSync(args.ca);
      } catch (error) {
        throw Error('Invalid CA.');
      }
    }
    payload.passphrase = args.password || '';
    this.httpsAgent = new https.Agent(payload);
  }

  createPaymentRequest(args) {
    const endpoint = '/api/v2/paymentrequests/';
    const id = getSwishID();

    // User provided required values
    // Verify and assign amount
    const amount = verify(args.amount, 'amount');
    if (amount === false) {
      throw new Error('Invalid Amount. Must be a valid amount between 1 and 999999999999.99 SEK.');
    }

    // Verify and assign payer alias
    const payerAlias = verify(args.phoneNumber, 'payerAlias');
    if (payerAlias === false) {
      throw new Error('Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.');
    }

    // Verify and assign message (blank by default)
    const message = verify(args.message || '', 'message');
    if (message === false) {
      throw new Error('Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.');
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

    if (args.payeePaymentReference) {
      config.data.payeePaymentReference = verify(args.payeePaymentReference, 'payeePaymentReference');
      if (config.data.payeePaymentReference === false) {
        throw new Error('Invalid Payee Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.');
      }
    }

    return new Promise((resolve, reject) => axios(config)
      .then((response) => {
        if (response.status !== 201) {
          throw Error('Non-201 Error');
        }
        return resolve({
          success: true,
          id
        });
      })
      .catch((error) => {
        reject(new SwishError(error.response.data));
      }));
  }
}

module.exports = Swish;
