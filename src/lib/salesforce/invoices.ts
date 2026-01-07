import { query, retrieve, type QueryResult } from "./client";

// Salesforce Invoice record type (assuming custom object or standard Invoice)
export interface SalesforceInvoice {
  Id: string;
  Name: string; // Invoice Number
  Invoice_Number__c?: string;
  AccountId__c: string;
  Amount__c: number;
  Amount_Paid__c?: number;
  Status__c: string;
  Due_Date__c?: string;
  Paid_Date__c?: string;
  Description__c?: string;
  Line_Items__c?: string; // JSON stored as text
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface InvoiceQueryResult {
  id: string;
  invoiceNumber: string;
  amount: number;
  amountPaid: number;
  status: string;
  dueDate: string | null;
  paidDate: string | null;
  description: string | null;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Map Salesforce Invoice to our app's Invoice format
 */
function mapSalesforceInvoice(sfInvoice: SalesforceInvoice): InvoiceQueryResult {
  let lineItems: InvoiceLineItem[] = [];
  
  if (sfInvoice.Line_Items__c) {
    try {
      lineItems = JSON.parse(sfInvoice.Line_Items__c);
    } catch {
      // If parsing fails, leave as empty array
    }
  }

  return {
    id: sfInvoice.Id,
    invoiceNumber: sfInvoice.Invoice_Number__c || sfInvoice.Name,
    amount: sfInvoice.Amount__c || 0,
    amountPaid: sfInvoice.Amount_Paid__c || 0,
    status: mapInvoiceStatus(sfInvoice.Status__c, sfInvoice.Due_Date__c),
    dueDate: sfInvoice.Due_Date__c || null,
    paidDate: sfInvoice.Paid_Date__c || null,
    description: sfInvoice.Description__c || null,
    lineItems,
    createdAt: sfInvoice.CreatedDate,
    updatedAt: sfInvoice.LastModifiedDate,
  };
}

/**
 * Map Salesforce status to our status values
 */
function mapInvoiceStatus(sfStatus: string, dueDate?: string): string {
  if (sfStatus === "Paid") return "paid";
  
  if (dueDate) {
    const due = new Date(dueDate);
    if (due < new Date()) {
      return "overdue";
    }
  }
  
  const statusMap: Record<string, string> = {
    "Draft": "pending",
    "Pending": "pending",
    "Sent": "pending",
    "Paid": "paid",
    "Overdue": "overdue",
    "Cancelled": "cancelled",
    "Void": "cancelled",
  };
  
  return statusMap[sfStatus] || "pending";
}

/**
 * Get all invoices for an account
 */
export async function getInvoicesByAccount(
  accountId: string
): Promise<InvoiceQueryResult[]> {
  // Note: Adjust the object name and field names based on your Salesforce schema
  const result = await query<SalesforceInvoice>(`
    SELECT 
      Id, Name, Invoice_Number__c, AccountId__c, Amount__c,
      Amount_Paid__c, Status__c, Due_Date__c, Paid_Date__c,
      Description__c, Line_Items__c, CreatedDate, LastModifiedDate
    FROM Invoice__c
    WHERE AccountId__c = '${accountId}'
    ORDER BY CreatedDate DESC
    LIMIT 100
  `);

  return result.records.map(mapSalesforceInvoice);
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(
  invoiceId: string
): Promise<InvoiceQueryResult> {
  const sfInvoice = (await retrieve("Invoice__c", invoiceId)) as unknown as SalesforceInvoice;
  return mapSalesforceInvoice(sfInvoice);
}

/**
 * Get unpaid invoices for an account
 */
export async function getUnpaidInvoices(
  accountId: string
): Promise<InvoiceQueryResult[]> {
  const result = await query<SalesforceInvoice>(`
    SELECT 
      Id, Name, Invoice_Number__c, AccountId__c, Amount__c,
      Amount_Paid__c, Status__c, Due_Date__c, Paid_Date__c,
      Description__c, Line_Items__c, CreatedDate, LastModifiedDate
    FROM Invoice__c
    WHERE AccountId__c = '${accountId}' 
      AND Status__c != 'Paid'
      AND Status__c != 'Cancelled'
    ORDER BY Due_Date__c ASC
    LIMIT 100
  `);

  return result.records.map(mapSalesforceInvoice);
}

/**
 * Get overdue invoices for an account
 */
export async function getOverdueInvoices(
  accountId: string
): Promise<InvoiceQueryResult[]> {
  const today = new Date().toISOString().split("T")[0];

  const result = await query<SalesforceInvoice>(`
    SELECT 
      Id, Name, Invoice_Number__c, AccountId__c, Amount__c,
      Amount_Paid__c, Status__c, Due_Date__c, Paid_Date__c,
      Description__c, Line_Items__c, CreatedDate, LastModifiedDate
    FROM Invoice__c
    WHERE AccountId__c = '${accountId}' 
      AND Status__c != 'Paid'
      AND Due_Date__c < ${today}
    ORDER BY Due_Date__c ASC
    LIMIT 100
  `);

  return result.records.map(mapSalesforceInvoice);
}

/**
 * Get invoice summary for dashboard
 */
export async function getInvoiceSummary(
  accountId: string
): Promise<{
  totalOutstanding: number;
  overdueCount: number;
  overdueAmount: number;
  pendingCount: number;
}> {
  const invoices = await getUnpaidInvoices(accountId);
  const today = new Date();

  let totalOutstanding = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  let pendingCount = 0;

  for (const invoice of invoices) {
    const remaining = invoice.amount - invoice.amountPaid;
    totalOutstanding += remaining;

    if (invoice.dueDate && new Date(invoice.dueDate) < today) {
      overdueCount++;
      overdueAmount += remaining;
    } else {
      pendingCount++;
    }
  }

  return {
    totalOutstanding,
    overdueCount,
    overdueAmount,
    pendingCount,
  };
}

