const axios = require('axios');
const fs = require('fs');
const https = require('https');
const SwishError = require('./swish-error');
const { getSwishID, verify } = require('./helpers');

class Swish {
  constructor(args) {
    const defaultCallback = 'https://swish-callback.com/';
    this.url = 'https://cpc.getswish.net/swish-cpcapi';

    // Verify and assign payee alias
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

    // Get certificate files
    if (args.cert) {
      try {
        this.cert = fs.readFileSync(args.cert);
      } catch (error) {
        this.cert = null;
      }
    }
    if (args.key) {
      try {
        this.key = fs.readFileSync(args.key);
      } catch (error) {
        this.key = null;
      }
    }
    if (args.ca) {
      try {
        this.ca = fs.readFileSync(args.ca);
      } catch (error) {
        this.ca = null;
      }
    }
    this.passphrase = args.password || '';
    this.httpsAgent = new https.Agent({
      cert: this.cert,
      key: this.key,
      ca: this.ca,
      passphrase: this.passphrase
    });
  }

  createPaymentRequest(args) {
    const endpoint = '/api/v2/paymentrequests/';
    const id = getSwishID();

    // User provided required values
    // Verify and assign amount
    const amount = verify(args.amount, 'amount');
    if (!amount) {
      throw new Error('Invalid Amount. Must be a valid amount between 1 and 999999999999.99 SEK.');
    }

    // Verify and assign payer alias
    const payerAlias = verify(args.phoneNumber, 'payerAlias');
    if (!payerAlias) {
      throw new Error('Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.');
    }

    // User provided optional values
    const message = args.message || '';

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
      .catch((error) => reject(new SwishError(error.response.data))));
  }
}

module.exports = Swish;
