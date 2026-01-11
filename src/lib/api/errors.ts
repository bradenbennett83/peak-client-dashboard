import { NextResponse } from "next/server";

/**
 * Standardized API error response format
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: string[];
}

/**
 * HTTP status codes for common error types
 */
export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: string,
  status: number,
  options?: { message?: string; details?: string[] }
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = { error };
  
  if (options?.message) {
    body.message = options.message;
  }
  
  if (options?.details && options.details.length > 0) {
    body.details = options.details;
  }
  
  return NextResponse.json(body, { status });
}

/**
 * Common error helpers
 */
export const ApiErrors = {
  unauthorized: (message?: string) =>
    errorResponse("Unauthorized", HttpStatus.UNAUTHORIZED, { message }),

  forbidden: (message?: string) =>
    errorResponse("Forbidden", HttpStatus.FORBIDDEN, { message }),

  notFound: (resource: string) =>
    errorResponse("Not found", HttpStatus.NOT_FOUND, {
      message: `${resource} not found`,
    }),

  badRequest: (message: string, details?: string[]) =>
    errorResponse("Bad request", HttpStatus.BAD_REQUEST, { message, details }),

  validationFailed: (details: string[]) =>
    errorResponse("Validation failed", HttpStatus.BAD_REQUEST, { details }),

  serverError: (message?: string) =>
    errorResponse("Internal server error", HttpStatus.INTERNAL_ERROR, {
      message: message || "An unexpected error occurred",
    }),

  configError: (message?: string) =>
    errorResponse("Server configuration error", HttpStatus.INTERNAL_ERROR, {
      message,
    }),
};
