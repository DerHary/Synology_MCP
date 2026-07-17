export type SafetyMode = "readonly" | "standard_mutation" | "admin_dangerous";

export type ModuleName =
  | "dsm"
  | "files"
  | "calendar"
  | "notes"
  | "contacts"
  | "chat"
  | "downloads"
  | "containers";

export type MutationLevel = "read" | "mutate" | "dangerous";

export type ChatTransport = "private-api" | "webhook";
export type ContainerTransport = "private-api" | "docker";

export interface ApiCallOptions {
  path?: string;
  method?: "GET" | "POST";
  requiresAuth?: boolean;
  session?: string;
  params?: Record<string, unknown>;
  body?: BodyInit;
  headers?: Record<string, string>;
  responseType?: "json" | "text";
}

export interface ApiCandidate {
  api: string;
  method: string;
  version: number;
  session?: string;
  path?: string;
  httpMethod?: "GET" | "POST";
}

export interface SynologyConfig {
  host: string;
  username: string;
  password: string;
  otpCode?: string;
  timeoutMs: number;
  ignoreTls: boolean;
  safetyMode: SafetyMode;
  enabledModules: Set<ModuleName>;
  chatTransport: ChatTransport;
  chatWebhookUrl?: string;
  containerTransport: ContainerTransport;
  dockerBaseUrl?: string;
}

export interface JsonMap {
  [key: string]: unknown;
}
