class SwishError extends Error {
  constructor(code, ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SwishError);
    }

    this.name = 'SwishError';
    this.status = false;
    this.errors = [{
      errorCode: code,
      errorMessage: this.lookupMessage(code),
      additionalInformation: null
    }];
  }

  lookupMessage = (code) => {
    switch (code) {
      case '0':
        return 'Alias Required.';

      case '1':
        return 'Invalid Merchant Alias. Alias must be only numbers, 10 digits long and start with 123.';

      case '2':
        return 'Invalid Payment Request Callback URL. Must be a valid URL that uses https protocol.';
      
      case '3':
        return 'Invalid Certificate.';
      
      case '4':
        return 'Invalid Key.';
      
      case '5':
        return 'Invalid CA.';
      
      case '6':
        return 'Invalid Amount. Must be a valid amount between 1 and 999999999999.99 SEK.';
      
      case '7':
        return 'Invalid Phone Number. Must be a valid Swedish phone number between 8 and 15 numerals (including country code and no leading zeros.';
      
      case '8':
        return 'Invalid Message. Must be less than 50 characters and only use a-ö, A-Ö, the numbers 0-9 and the special characters :;.,?!()”.';

      case '9':
        return 'Invalid Age Limit. Must be an integer between 1 and 99.';
      
      case '10':
        return 'Invalid Payee Payment Reference. Must be between 1 and 36 characters and only use a-ö, A-Ö and the numbers 0-9.';

      case '11':
        return 'Invalid Person Nummer. Must be 10 or 12 digits and a valid Swedish Personnummer or Sammordningsnummer.';
      
      case '12':
        return 'Non-201 Error';
      
      case '13':
        return 'ID must be supplied to receive payment request.';
      
      case '14':
        return 'Non-200 Error';
      
      case 'FF08':
        return 'Payment Reference is invalid';

      case 'BE18':
        return 'Payer alias is invalid';
      
      case 'RP03':
        return 'Callback URL is missing or does not use Https';
      
      case 'RP04':
        return 'No payment request found related to a token';
    
      default:
        break;
    }
  }
}

module.exports = SwishError;
