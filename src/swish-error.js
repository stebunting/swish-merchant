class SwishError extends Error {
  constructor(codes, ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SwishError);
    }

    this.name = 'SwishError';
    this.status = false;
    this.errors = [];
    codes.forEach((code) => {
      this.errors.push({
        errorCode: code,
        errorMessage: SwishError.lookupMessage(code),
        additionalInformation: null
      });
    });
  }

  static lookupMessage(code) {
    switch (code) {
      // Swish Errors
      case 'FF08':
        return 'Payment Reference is invalid';

      case 'RP03':
        return 'Callback URL is missing or does not use HTTPS';

      case 'BE18':
        return 'Payer alias is invalid';

      case 'RP01':
        return 'Missing Merchant Swish Number.';

      case 'AM02':
        return 'Amount value is too large.';

      case 'AM03':
        return 'Invalid or missing Currency.';

      case 'AM06':
        return 'Specified transaction amount is less than agreed minimum.';

      case 'RP02':
        return 'Wrong formatted message.';

      case 'RP04':
        return 'No payment request found related to a token';

      case 'RP06':
        return 'A payment request already exists for that payer. Only applicable for Swish e-commerce.';

      case 'ACMT03':
        return 'Payer not Enrolled.';

      case 'ACMT01':
        return 'Counterpart is not activated.';

      case 'ACMT07':
        return 'Payee not Enrolled.';

      case 'VR01':
        return 'Payer does not meet age limit.';

      case 'VR02':
        return 'The payer alias in the request is not enroled in swish with the supplied ssn';

      case 'PA02':
        return 'Amount value is missing or not a valid number.';

      // Validation Errors
      case 'VL02':
        return 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.';

      case 'VL03':
        return 'Invalid Certificate.';

      case 'VL04':
        return 'Invalid Key.';

      case 'VL05':
        return 'Invalid CA.';

      case 'VL10':
        return 'Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.';

      case 'VL11':
        return 'Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.';

      case 'VL12':
        return 'Invalid Age Limit. Must be an integer between 1 and 99.';

      case 'VL13':
        return 'Invalid Payee Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.';

      case 'VL14':
        return 'Invalid Person Nummer. Must be 10 or 12 digits and a valid Swedish Personnummer or Sammordningsnummer.';

      case 'VL15':
        return 'ID must be supplied to receive payment request.';

      case 'VL16':
        return 'Non-200 Error';

      case 'VL17':
        return 'Non-201 Error';

      default:
        return '';
    }
  }
}

module.exports = SwishError;
