import { ModuleName, SynologyConfig } from "./types.js";

const ALL_MODULES: ModuleName[] = [
  "dsm",
  "files",
  "calendar",
  "notes",
  "contacts",
  "chat",
  "downloads",
  "containers",
];

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseModules(value: string | undefined): Set<ModuleName> {
  if (!value?.trim()) {
    return new Set(ALL_MODULES);
  }

  const selected = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) as ModuleName[];

  return new Set(selected.filter((item) => ALL_MODULES.includes(item)));
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): SynologyConfig {
  const host = env.SYN_HOST?.trim();
  const username = env.SYN_USERNAME?.trim();
  const password = env.SYN_PASSWORD?.trim();

  if (!host || !username || !password) {
    throw new Error("Missing required env vars: SYN_HOST, SYN_USERNAME, SYN_PASSWORD");
  }

  return {
    host: host.replace(/\/+$/, ""),
    username,
    password,
    otpCode: env.SYN_OTP_CODE?.trim() || undefined,
    timeoutMs: Number(env.SYN_TIMEOUT_MS ?? "30000"),
    ignoreTls: parseBool(env.SYN_IGNORE_TLS, false),
    safetyMode: (env.SYN_SAFETY_MODE as SynologyConfig["safetyMode"]) ?? "readonly",
    enabledModules: parseModules(env.SYN_ENABLED_MODULES),
    chatTransport: (env.SYN_CHAT_TRANSPORT as SynologyConfig["chatTransport"]) ?? "private-api",
    chatWebhookUrl: env.SYN_CHAT_WEBHOOK_URL?.trim() || undefined,
    containerTransport:
      (env.SYN_CONTAINER_TRANSPORT as SynologyConfig["containerTransport"]) ?? "private-api",
    dockerBaseUrl: env.SYN_DOCKER_BASE_URL?.trim() || undefined,
  };
}
