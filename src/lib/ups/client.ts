/**
 * UPS API Client for shipping label generation
 * Uses UPS OAuth 2.0 authentication
 */

interface UPSAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface UPSAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvinceCode: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
}

interface UPSShipmentRequest {
  shipper: UPSAddress;
  shipTo: UPSAddress;
  shipFrom: UPSAddress;
  service: "02" | "03"; // 02 = 2-Day, 03 = Ground
  packageWeight: number; // in lbs
  description?: string;
}

interface UPSShipmentResponse {
  trackingNumber: string;
  labelUrl: string;
  labelData: string; // Base64 encoded label
  estimatedDeliveryDate?: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get UPS OAuth access token
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.UPS_CLIENT_ID;
  const clientSecret = process.env.UPS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("UPS credentials not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(
    "https://onlinetools.ups.com/security/v1/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials",
    }
  );

  if (!response.ok) {
    throw new Error(`UPS auth failed: ${response.statusText}`);
  }

  const data: UPSAuthResponse = await response.json();
  accessToken = data.access_token;
  // Set expiry 5 minutes before actual expiry
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

/**
 * Peak Dental Studio address (ship-to for inbound labels)
 */
export const PEAK_DENTAL_ADDRESS: UPSAddress = {
  name: "Peak Dental Studio",
  addressLine1: "123 Peak Way", // Update with actual address
  city: "Denver",
  stateProvinceCode: "CO",
  postalCode: "80202",
  countryCode: "US",
  phone: "3035551234",
};

/**
 * Create a UPS shipping label (inbound to Peak)
 */
export async function createInboundShippingLabel(
  practiceAddress: UPSAddress,
  packageWeight: number = 1
): Promise<UPSShipmentResponse> {
  const token = await getAccessToken();
  const accountNumber = process.env.UPS_ACCOUNT_NUMBER;

  if (!accountNumber) {
    throw new Error("UPS account number not configured");
  }

  const requestBody = {
    ShipmentRequest: {
      Request: {
        SubVersion: "1801",
        RequestOption: "nonvalidate",
        TransactionReference: {
          CustomerContext: `Peak-${Date.now()}`,
        },
      },
      Shipment: {
        Description: "Dental Cases",
        Shipper: {
          Name: practiceAddress.name,
          ShipperNumber: accountNumber,
          Address: {
            AddressLine: [
              practiceAddress.addressLine1,
              practiceAddress.addressLine2,
            ].filter(Boolean),
            City: practiceAddress.city,
            StateProvinceCode: practiceAddress.stateProvinceCode,
            PostalCode: practiceAddress.postalCode,
            CountryCode: practiceAddress.countryCode,
          },
          Phone: practiceAddress.phone
            ? { Number: practiceAddress.phone }
            : undefined,
        },
        ShipTo: {
          Name: PEAK_DENTAL_ADDRESS.name,
          Address: {
            AddressLine: [PEAK_DENTAL_ADDRESS.addressLine1],
            City: PEAK_DENTAL_ADDRESS.city,
            StateProvinceCode: PEAK_DENTAL_ADDRESS.stateProvinceCode,
            PostalCode: PEAK_DENTAL_ADDRESS.postalCode,
            CountryCode: PEAK_DENTAL_ADDRESS.countryCode,
          },
          Phone: PEAK_DENTAL_ADDRESS.phone
            ? { Number: PEAK_DENTAL_ADDRESS.phone }
            : undefined,
        },
        ShipFrom: {
          Name: practiceAddress.name,
          Address: {
            AddressLine: [
              practiceAddress.addressLine1,
              practiceAddress.addressLine2,
            ].filter(Boolean),
            City: practiceAddress.city,
            StateProvinceCode: practiceAddress.stateProvinceCode,
            PostalCode: practiceAddress.postalCode,
            CountryCode: practiceAddress.countryCode,
          },
          Phone: practiceAddress.phone
            ? { Number: practiceAddress.phone }
            : undefined,
        },
        PaymentInformation: {
          ShipmentCharge: {
            Type: "01", // Transportation
            BillShipper: {
              AccountNumber: accountNumber,
            },
          },
        },
        Service: {
          Code: "02", // 2-Day Air
          Description: "UPS 2nd Day Air",
        },
        Package: {
          Description: "Dental Cases",
          Packaging: {
            Code: "02", // Customer Supplied Package
            Description: "Customer Supplied Package",
          },
          Dimensions: {
            UnitOfMeasurement: { Code: "IN" },
            Length: "12",
            Width: "8",
            Height: "6",
          },
          PackageWeight: {
            UnitOfMeasurement: { Code: "LBS" },
            Weight: packageWeight.toString(),
          },
        },
      },
      LabelSpecification: {
        LabelImageFormat: {
          Code: "ZPL", // or "GIF", "PNG"
          Description: "ZPL Label",
        },
        LabelStockSize: {
          Height: "6",
          Width: "4",
        },
      },
    },
  };

  const response = await fetch(
    "https://onlinetools.ups.com/api/shipments/v1801/ship",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        transId: `Peak-${Date.now()}`,
        transactionSrc: "PeakDentalPortal",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("UPS API error:", errorText);
    throw new Error(`UPS shipment creation failed: ${response.statusText}`);
  }

  const data = await response.json();

  const shipmentResult = data.ShipmentResponse?.ShipmentResults;
  if (!shipmentResult) {
    throw new Error("Invalid UPS response: missing ShipmentResults");
  }

  const packageResult = shipmentResult.PackageResults;
  const trackingNumber = packageResult?.TrackingNumber;
  const labelImage =
    packageResult?.ShippingLabel?.GraphicImage ||
    packageResult?.ShippingLabel?.HTMLImage;

  if (!trackingNumber) {
    throw new Error("Invalid UPS response: missing tracking number");
  }

  return {
    trackingNumber,
    labelUrl: "", // Would need to store and serve the label
    labelData: labelImage || "",
    estimatedDeliveryDate:
      shipmentResult.TimeInTransit?.ServiceSummary?.EstimatedArrival
        ?.Arrival?.Date,
  };
}

/**
 * Get tracking information for a shipment
 */
export async function getTrackingInfo(trackingNumber: string): Promise<{
  status: string;
  statusDescription: string;
  estimatedDelivery?: string;
  lastLocation?: string;
  deliveredAt?: string;
}> {
  const token = await getAccessToken();

  const response = await fetch(
    `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        transId: `Peak-${Date.now()}`,
        transactionSrc: "PeakDentalPortal",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`UPS tracking failed: ${response.statusText}`);
  }

  const data = await response.json();
  const shipment = data.trackResponse?.shipment?.[0];
  const pkg = shipment?.package?.[0];
  const activity = pkg?.activity?.[0];

  return {
    status: pkg?.currentStatus?.code || "unknown",
    statusDescription: pkg?.currentStatus?.description || "Unknown",
    estimatedDelivery: pkg?.deliveryDate?.date,
    lastLocation: activity?.location?.address?.city,
    deliveredAt: pkg?.deliveryDate?.date,
  };
}

export type { UPSAddress, UPSShipmentRequest, UPSShipmentResponse };

