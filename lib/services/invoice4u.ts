/**
 * Invoice4U Clearing API Integration
 * Using iframe-based payment flow
 */

const INVOICE4U_API_URL = 'https://api.invoice4u.co.il/Services/ApiService.svc';

export interface ClearingRequest {
  // Required
  apiKey: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;

  // Optional
  paymentsNum?: number; // Number of payments (תשלומים)
  currency?: string; // Default: ILS
  orderId?: string;

  // Document creation
  createDocument?: boolean;
  documentHeadline?: string;
  documentComments?: string;

  // Token options
  addToken?: boolean;
  addTokenAndCharge?: boolean;
  chargeWithToken?: boolean;
}

export interface ClearingResponse {
  success: boolean;
  clearingUrl?: string; // URL for iframe
  error?: string;
  errorCode?: number;
}

export interface ClearingResult {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  status?: string;
  error?: string;
}

class Invoice4UService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.INVOICE4U_API_KEY || '';
  }

  /**
   * Create clearing request and get iframe URL
   */
  async createClearingRequest(request: Omit<ClearingRequest, 'apiKey'>): Promise<ClearingResponse> {
    try {
      const requestBody = {
        Invoice4UUserApiKey: this.apiKey,
        Type: 1, // Regular clearing
        CreditCardCompanyType: 7, // Meshulam - can be changed
        IsAutoCreateCustomer: true,
        FullName: request.customerName,
        Email: request.customerEmail,
        Phone: request.customerPhone,
        Sum: request.amount,
        Description: request.description,
        PaymentsNum: request.paymentsNum || 1,
        Currency: request.currency || 'ILS',
        OrderIdClientUsage: request.orderId || '',
        ReturnUrl: request.returnUrl,
        IsDocCreate: request.createDocument ?? true,
        DocHeadline: request.documentHeadline || 'קבלה על תשלום',
        DocComments: request.documentComments || '',
        DocLanguage: 'he',
        AddToken: request.addToken || false,
        AddTokenAndCharge: request.addTokenAndCharge || false,
        ChargeWithToken: request.chargeWithToken || false,
      };

      console.log('Invoice4U request URL:', `${INVOICE4U_API_URL}/ProcessApiRequestV2`);
      console.log('Invoice4U request body (without key):', { ...requestBody, Invoice4UUserApiKey: '***' });

      // WCF services expect the body wrapped in a "request" parameter
      const wrappedBody = { request: requestBody };

      const response = await fetch(`${INVOICE4U_API_URL}/ProcessApiRequestV2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wrappedBody),
      });

      const rawData = await response.json();
      // WCF services wrap response in 'd' property
      const data = rawData.d || rawData;

      console.log('Invoice4U response:', JSON.stringify(data, null, 2));

      // Check for errors array
      if (data.Errors && data.Errors.length > 0) {
        const errorMessages = data.Errors.map((e: any) => e.Message || e.ErrorMessage || JSON.stringify(e)).join(', ');
        console.error('Invoice4U errors:', data.Errors);
        return {
          success: false,
          error: errorMessages || 'Invoice4U returned errors',
          errorCode: data.Errors[0]?.Code,
        };
      }

      if (data.ClearingRedirectUrl) {
        return {
          success: true,
          clearingUrl: data.ClearingRedirectUrl,
        };
      } else {
        return {
          success: false,
          error: data.ErrorMessage || data.Message || 'No clearing URL returned',
          errorCode: data.ErrorCode,
        };
      }
    } catch (error) {
      console.error('Invoice4U clearing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get clearing log by payment ID
   */
  async getClearingLog(paymentId: string): Promise<ClearingResult> {
    try {
      const response = await fetch(`${INVOICE4U_API_URL}/GetClearingLogByParams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Invoice4UUserApiKey: this.apiKey,
          PaymentId: paymentId,
        }),
      });

      const data = await response.json();

      if (data.Success) {
        return {
          success: true,
          transactionId: data.TransactionId,
          paymentId: data.PaymentId,
          status: data.Status,
        };
      } else {
        return {
          success: false,
          error: data.ErrorMessage || 'Failed to get clearing log',
        };
      }
    } catch (error) {
      console.error('Invoice4U get clearing log error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
let invoice4uInstance: Invoice4UService | null = null;

export function getInvoice4UService(): Invoice4UService {
  if (!invoice4uInstance) {
    invoice4uInstance = new Invoice4UService();
  }
  return invoice4uInstance;
}

export { Invoice4UService };
