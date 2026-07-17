export class SynologyApiError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "SynologyApiError";
  }
}

export class UnsupportedTransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedTransportError";
  }
}

const COMMON_ERROR_CODES: Record<number, string> = {
  100: "Unknown error",
  101: "Invalid parameter",
  102: "Requested API does not exist",
  103: "Requested method does not exist",
  104: "Requested API version is not supported",
  105: "The logged in session does not have permission",
  106: "Session timeout",
  107: "Session interrupted by duplicate login",
  117: "Need manager rights for operation",
  119: "SID not found",
  400: "No such account or incorrect password",
  401: "Account disabled",
  402: "Permission denied",
  403: "2-factor authentication code required",
  404: "Failed to authenticate 2-factor authentication code",
  406: "2-factor authentication is enforced",
  407: "Blocked IP source",
  408: "Expired password cannot change",
  409: "Expired password",
  410: "Password must be changed",
};

export function explainSynologyError(details: unknown): string | undefined {
  if (!details || typeof details !== "object") {
    return undefined;
  }

  const code = (details as { code?: unknown }).code;
  if (typeof code !== "number") {
    return undefined;
  }

  return COMMON_ERROR_CODES[code];
}
