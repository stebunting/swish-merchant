# Swish For Merchants
Node.js library for integrating Swish for Merchants. In Progress!

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
});

// Call the methods
try {
  swish.createPaymentRequest({
    phoneNumber: 'USERS_PHONE_NUMER',
    amount: 'AMOUNT_TO_REQUEST'
  });
} catch (error) {
  // Catch
}
```