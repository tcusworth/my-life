import { NextResponse } from "next/server";
import {
  SyncAuthError,
  SyncForbiddenError,
  SyncNotFoundError,
  SyncValidationError,
} from "@/lib/sync/errors";
import { formatValidationIssues } from "@/lib/sync/validation";

export function syncJson<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function syncError(error: unknown) {
  if (error instanceof SyncValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "VALIDATION_ERROR",
        issues: error.issues,
      },
      { status: error.status }
    );
  }

  if (
    error instanceof SyncAuthError ||
    error instanceof SyncForbiddenError ||
    error instanceof SyncNotFoundError
  ) {
    return NextResponse.json(
      { error: error.message, code: error.name },
      { status: error.status }
    );
  }

  if (error instanceof Error && error.message.includes("POCKETBASE_ADMIN")) {
    return NextResponse.json(
      {
        error: "Sync API is not configured on the server",
        code: "SERVER_MISCONFIGURED",
      },
      { status: 503 }
    );
  }

  console.error("[sync-api]", error);

  return NextResponse.json(
    { error: "Internal sync API error", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new SyncValidationError("Invalid JSON body", [
      { path: "$", message: "Request body must be valid JSON" },
    ]);
  }
}

export function assertValidation<T>(
  result: { ok: true; data: T } | { ok: false; issues: Array<{ path: string; message: string }> }
): T {
  if (!result.ok) {
    throw new SyncValidationError(
      formatValidationIssues(result.issues),
      result.issues
    );
  }
  return result.data;
}
