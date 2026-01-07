import { query, retrieve, type QueryResult } from "./client";

// Salesforce Case record type
export interface SalesforceCase {
  Id: string;
  CaseNumber: string;
  Subject: string;
  Status: string;
  Priority: string;
  Description?: string;
  AccountId: string;
  ContactId?: string;
  Patient_Name__c?: string;
  Tooth_Numbers__c?: string;
  Restoration_Type__c?: string;
  Material__c?: string;
  Shade__c?: string;
  Due_Date__c?: string;
  Is_Rush__c?: boolean;
  Special_Instructions__c?: string;
  Tracking_Number__c?: string;
  Carrier__c?: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface CaseQueryResult {
  id: string;
  caseNumber: string;
  patientName: string;
  status: string;
  caseType: string;
  material: string | null;
  shade: string | null;
  teethNumbers: string | null;
  dueDate: string | null;
  isRush: boolean;
  trackingNumber: string | null;
  carrier: string | null;
  instructions: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map Salesforce Case to our app's Case format
 */
function mapSalesforceCase(sfCase: SalesforceCase): CaseQueryResult {
  return {
    id: sfCase.Id,
    caseNumber: sfCase.CaseNumber,
    patientName: sfCase.Patient_Name__c || sfCase.Subject || "Unknown",
    status: mapCaseStatus(sfCase.Status),
    caseType: sfCase.Restoration_Type__c || "General",
    material: sfCase.Material__c || null,
    shade: sfCase.Shade__c || null,
    teethNumbers: sfCase.Tooth_Numbers__c || null,
    dueDate: sfCase.Due_Date__c || null,
    isRush: sfCase.Is_Rush__c || sfCase.Priority === "High",
    trackingNumber: sfCase.Tracking_Number__c || null,
    carrier: sfCase.Carrier__c || null,
    instructions: sfCase.Special_Instructions__c || sfCase.Description || null,
    createdAt: sfCase.CreatedDate,
    updatedAt: sfCase.LastModifiedDate,
  };
}

/**
 * Map Salesforce status to our status values
 */
function mapCaseStatus(sfStatus: string): string {
  const statusMap: Record<string, string> = {
    "New": "received",
    "Working": "in_production",
    "In Production": "in_production",
    "Quality Check": "quality_check",
    "Ready to Ship": "ready_to_ship",
    "Shipped": "shipped",
    "Delivered": "delivered",
    "Closed": "delivered",
    "Escalated": "on_hold",
  };
  return statusMap[sfStatus] || sfStatus.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Get all cases for an account
 */
export async function getCasesByAccount(
  accountId: string
): Promise<CaseQueryResult[]> {
  const result = await query<SalesforceCase>(`
    SELECT 
      Id, CaseNumber, Subject, Status, Priority, Description,
      AccountId, ContactId, Patient_Name__c, Tooth_Numbers__c,
      Restoration_Type__c, Material__c, Shade__c, Due_Date__c,
      Is_Rush__c, Special_Instructions__c, Tracking_Number__c,
      Carrier__c, CreatedDate, LastModifiedDate
    FROM Case
    WHERE AccountId = '${accountId}'
    ORDER BY CreatedDate DESC
    LIMIT 100
  `);

  return result.records.map(mapSalesforceCase);
}

/**
 * Get a single case by ID
 */
export async function getCaseById(caseId: string): Promise<CaseQueryResult> {
  const sfCase = (await retrieve("Case", caseId)) as unknown as SalesforceCase;
  return mapSalesforceCase(sfCase);
}

/**
 * Get cases by status
 */
export async function getCasesByStatus(
  accountId: string,
  status: string
): Promise<CaseQueryResult[]> {
  const result = await query<SalesforceCase>(`
    SELECT 
      Id, CaseNumber, Subject, Status, Priority, Description,
      AccountId, ContactId, Patient_Name__c, Tooth_Numbers__c,
      Restoration_Type__c, Material__c, Shade__c, Due_Date__c,
      Is_Rush__c, Special_Instructions__c, Tracking_Number__c,
      Carrier__c, CreatedDate, LastModifiedDate
    FROM Case
    WHERE AccountId = '${accountId}' AND Status = '${status}'
    ORDER BY CreatedDate DESC
    LIMIT 100
  `);

  return result.records.map(mapSalesforceCase);
}

/**
 * Get recent cases (last 30 days)
 */
export async function getRecentCases(
  accountId: string,
  limit = 10
): Promise<CaseQueryResult[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await query<SalesforceCase>(`
    SELECT 
      Id, CaseNumber, Subject, Status, Priority, Description,
      AccountId, ContactId, Patient_Name__c, Tooth_Numbers__c,
      Restoration_Type__c, Material__c, Shade__c, Due_Date__c,
      Is_Rush__c, Special_Instructions__c, Tracking_Number__c,
      Carrier__c, CreatedDate, LastModifiedDate
    FROM Case
    WHERE AccountId = '${accountId}' 
      AND CreatedDate >= ${thirtyDaysAgo.toISOString()}
    ORDER BY CreatedDate DESC
    LIMIT ${limit}
  `);

  return result.records.map(mapSalesforceCase);
}

