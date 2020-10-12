# Swish For Merchants
[![Build Status](https://travis-ci.com/stebunting/swish-merchant.svg?branch=master)](https://travis-ci.com/stebunting/swish-merchant)
[![codecov](https://codecov.io/gh/stebunting/swish-merchant/branch/master/graph/badge.svg)](https://codecov.io/gh/stebunting/swish-merchant)
[![npm](https://img.shields.io/npm/v/swish-merchant)](https://www.npmjs.com/package/swish-merchant)

Promise-based Node.js library for integrating Swish for Merchants quickly and simply.

 - Supports creating payments, getting payment details, creating refunds and retrieving refunds.
 - Add your certificate files as files or strings (auto-checking).

## Before you begin

 - Sign up for a 'Swish for Merchants' account with your bank
 - Get your certificates from the [Swish Portal](https://portal.swish.nu/).

## Installation

 - Install with npm
```
npm i swish-merchant
```

## API Documentation

Require The Library
```javascript
const Swish = require('swish-merchant');
```

### Instantiate the class with your details

```javascript
const swish = new Swish({
  alias: 'YOUR_SWISH_FOR_MERCHANTS_ALIAS',
  paymentRequestCallback: 'YOUR_CALLBACK_URL_FOR_PAYMENT_REQUESTS',
  cert: 'PATH_TO_YOUR_SWISH_CERT_FILE',
  key: 'PATH_TO_YOUR_SWISH_KEY_FILE'
}).then((response) => {})
  .catch((error) => {});
```

### Create New Payment Request

```javascript
swish.createPaymentRequest({
  phoneNumber: 'USERS_PHONE_NUMER',                 // Required
  amount: 'AMOUNT_TO_REQUEST',                      // Required
  message: 'MESSAGE_TO_USER',                       // Optional
  payeePaymentReference: 'CUSTOM_REFERENCE',        // Optional
  personNummer: 'USERS_PERSONNUMMER',               // Optional
  ageLimit: 'AGE_LIMIT_FOR_PURCHASE'                // Optional
}).then((response) => {})
  .catch((error) => {});
```

Response contains success flag and payment ID.
```javascript
{
  success: true,
  id: 'ID_TO_CREATED_PAYMENT'
}
```

### Retrieve Created Payment Request

```javascript
swish.retrievePaymentRequest({
  id: 'PAYMENT_REQUEST_ID',                         // Required
}).then((response) => {})
  .catch((error) => {});
```

Response contains success flag and payment details.
```javascript
{
  success: true,
  data: {
    id: 'PAYMENT_ID',
    payeePaymentReference: 'CUSTOM_REFERENCE',
    paymentReference: 'PAYMENT_REFERENCE',
    callbackUrl: 'YOUR_CALLBACK_URL',
    payerAlias: 'PAYER_SWISH_ALIAS',
    payeeAlias: 'YOUR_SWISH_FOR_MERCHANTS_ALIAS',
    amount: 'AMOUNT',
    currency: 'SEK',
    message: 'CUSTOM_MESSAGE',
    status: 'PAID',
    dateCreated: 'TIMESTAMP',
    datePaid: 'TIMESTAMP',
    errorCode: null,
    errorMessage: null
  }
}
```

### Create New Refund Request

```javascript
swish.createRefundRequest({
  originalPaymentReference: 'PAYMENT_TO_REFUND'     // Required
  amount: 'AMOUNT_TO_REFUND',                       // Required
  message: 'MESSAGE_TO_USER'                        // Optional
  payerPaymentReference: 'CUSTOM_REFERENCE'         // Optional
}).then((response) => {})
  .catch((error) => {});
```

Response contains success flag and refund ID.
```javascript
{
  success: true,
  id: 'ID_TO_CREATED_REFUND'
}
```

### Retrieve Created Refund Request

```javascript
swish.retrieveRefundRequest({
  id: 'REFUND_REQUEST_ID',                          // Required
}).then((response) => {})
  .catch((error) => {});
```

Response contains success flag and refund details.
```javascript
{
  success: true,
  data: {
    id: 'REFUND_ID',
    paymentReference: 'PAYMENT_REFERENCE',
    payerPaymentReference: 'CUSTOM_PAYMENT_REFERENCE',
    originalPaymentReference: 'ORIGINAL_PAYMENT_REFERENCE',
    callbackUrl: 'YOUR_CALLBACK_URL',
    payerAlias: 'YOUR_SWISH_FOR_MERCHANTS_ALIAS',
    payeeAlias: null,
    amount: 'AMOUNT',
    currency: 'SEK',
    message: 'CUSTOM_MESSAGE',
    status: 'CREATED',
    dateCreated: 'TIMESTAMP',
    datePaid: 'TIMESTAMP',
    errorCode: null,
    errorMessage: null,
    additionalInformation: null
  }
}
```
