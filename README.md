# Swish For Merchants
[![Build Status](https://travis-ci.com/stebunting/swish-merchant.svg?branch=master)](https://travis-ci.com/stebunting/swish-merchant)
[![codecov](https://codecov.io/gh/stebunting/swish-merchant/branch/master/graph/badge.svg)](https://codecov.io/gh/stebunting/swish-merchant)

Promise-based Node.js library for integrating Swish for Merchants quickly and simply.

 - Currently supports creating payments, getting payment details and creating refunds.
 - Add your certificate files as files or strings (auto-checks).
In Progress!

## API
```javascript
// Require the library
const Swish = require('swish-merchant');

// Instantiate the class with your details
const swish = new Swish({
  alias: 'YOUR_SWISH_FOR_MERCHANTS_ALIAS',
  paymentRequestCallback: 'YOUR_CALLBACK_URL_FOR_PAYMENT_REQUESTS',
  cert: 'PATH_TO_YOUR_SWISH_CERT_FILE',
  key: 'PATH_TO_YOUR_SWISH_KEY_FILE'
}).then((response) => {})
  .catch((error) => {});

// Create Payment Request
swish.createPaymentRequest({
  phoneNumber: 'USERS_PHONE_NUMER',                 // Required
  amount: 'AMOUNT_TO_REQUEST',                      // Required
  message: 'MESSAGE_TO_USER',                       // Optional
  payeePaymentReference: 'CUSTOM_REFERENCE',        // Optional
  personNummer: 'USERS_PERSONNUMMER',               // Optional
  ageLimit: 'AGE_LIMIT_FOR_PURCHASE'                // Optional
}).then((data) => {})
  .catch((error) => {});

// Retrieve Payment Request
swish.retrievePaymentRequest({
  id: 'PAYMENT_REQUEST_ID',                         // Required
}).then((data) => {})
  .catch((error) => {});

// Create Refund Request
swish.createRefundRequest({
  originalPaymentReference: 'PAYMENT_TO_REFUND'     // Required
  amount: 'AMOUNT_TO_REFUND',                       // Required
  message: 'MESSAGE_TO_USER'                        // Optional
  payerPaymentReference: 'CUSTOM_REFERENCE'         // Optional
}).then((data) => {})
  .catch((error) => {});
```