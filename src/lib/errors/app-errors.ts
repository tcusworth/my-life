export type AppErrorCode =
  | "UNAUTHORIZED"
  | "MISSING_OPENAI_KEY"
  | "POCKETBASE_UNREACHABLE"
  | "OAUTH_NOT_CONFIGURED"
  | "EMPTY_EXTRACTION"
  | "INVALID_INPUT"
  | "AI_EXTRACTION_FAILED"
  | "APPLY_FAILED";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function getErrorCode(error: unknown): AppErrorCode | null {
  if (error instanceof AppError) return error.code;
  return null;
}

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  UNAUTHORIZED: "You must be signed in to perform this action.",
  MISSING_OPENAI_KEY:
    "AI inbox processing is not configured. Set OPENAI_API_KEY in your environment.",
  POCKETBASE_UNREACHABLE:
    "Cannot reach PocketBase. Check NEXT_PUBLIC_POCKETBASE_URL and that the VPS instance is running.",
  OAUTH_NOT_CONFIGURED:
    "Google OAuth is not enabled in PocketBase. Configure it in PocketBase Admin → Settings → Auth providers.",
  EMPTY_EXTRACTION:
    "No tasks, projects, contacts, or follow-ups were found in that text. Try adding more detail.",
  INVALID_INPUT: "The submitted input is invalid.",
  AI_EXTRACTION_FAILED: "AI extraction failed. Try again or shorten the input.",
  APPLY_FAILED: "Failed to create records. Please try again.",
};
