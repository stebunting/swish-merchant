declare module 'swish-merchant' {
  interface ClassConstructor {
    alias: string
    paymentRequestCallback: string,
    cert: string,
    key: string,
    ca?: string,
    passphrase?: string
  }

  interface SwishPaymentData {
    id: string,
    payeePaymentReference: string,
    paymentReference: string,
    callbackUrl: string,
    payerAlias: string,
    payeeAlias: string,
    amount: number,
    currency: string,
    message: string,
    status: string,
    dateCreated: string,
    datePaid: string | null,
    errorCode: string | null,
    errorMessage: string | null
  }

  interface SwishRefundData {
    id: string,
    paymentReference: string | null,
    payerPaymentReference: string,
    originalPaymentReference: string,
    callbackUrl: string,
    payerAlias: string,
    payeeAlias: string | null,
    amount: number,
    currency: string,
    message: string,
    status: string,
    dateCreated: string,
    datePaid: string | null,
    errorMessage: string | null,
    additionalInformation: string | null,
    errorCode: string | null
  }

  interface RequestPaymentPayload {
    phoneNumber: string,
    amount: string | number,
    message?: string,
    payeePaymentReference?: string,
    personNummer?: string,
    ageLimit?: string | number
  }

  interface RequestPaymentResponse {
    success: boolean,
    id: string
  }

  interface RetrievePaymentPayload {
    id: string
  }

  interface RetrievePaymentResponse {
    success: boolean,
    data: SwishPaymentData
  }

  interface RequestRefundPayload {
    amount: string | number,
    originalPaymentReference?: string,
    message?: string,
    payerPaymentReference?: string
  }

  interface RequestRefundResponse {
    success: boolean,
    id: string
  }

  interface RetrieveRefundPayload {
    id: string
  }

  interface RetrieveRefundResponse {
    success: boolean,
    data: SwishRefundData
  }

  export class Swish {
    constructor(args: ClassConstructor)

    createPaymentRequest(args: RequestPaymentPayload): Promise<RequestPaymentResponse>

    retrievePaymentRequest(args: RetrievePaymentPayload): Promise<RetrievePaymentResponse>

    createRefundReqeust(args: RequestRefundPayload): Promise<RequestRefundResponse>

    retrieveRefundRequest(args: RetrieveRefundPayload): Promise<RetrieveRefundPayload>
  }
}