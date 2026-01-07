export * from "./database.types";

// Case types (from Salesforce)
export type CaseStatus =
  | "Submitted"
  | "In Production"
  | "Quality Check"
  | "Shipped"
  | "Delivered";

export type Urgency = "Standard" | "Rush";

export interface Case {
  id: string;
  caseNumber: string;
  patientName: string;
  patientDob?: string;
  doctorName: string;
  status: CaseStatus;
  toothNumbers: number[];
  restorationType: string;
  material: string;
  shade: string;
  dueDate: string;
  urgency: Urgency;
  specialInstructions?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice types (from Salesforce)
export type InvoiceStatus = "Pending" | "Paid" | "Overdue";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId?: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  pdfUrl?: string;
  createdAt: string;
}

// Address type
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Practice settings
export interface PracticeSettings {
  emailNotifications: boolean;
  defaultShadeGuide: string;
}

// Notification types
export type NotificationType =
  | "case_status"
  | "invoice_issued"
  | "invoice_reminder"
  | "shipment_delivered";

// User with profile
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "admin" | "staff";
  practiceId: string;
  practiceName: string;
}

