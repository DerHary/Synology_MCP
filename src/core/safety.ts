import { MutationLevel, SafetyMode } from "./types.js";

const ALLOWED_BY_MODE: Record<SafetyMode, MutationLevel[]> = {
  readonly: ["read"],
  standard_mutation: ["read", "mutate"],
  admin_dangerous: ["read", "mutate", "dangerous"],
};

export function assertSafety(mode: SafetyMode, requested: MutationLevel, toolName: string): void {
  if (!ALLOWED_BY_MODE[mode].includes(requested)) {
    throw new Error(
      `Tool "${toolName}" requires "${requested}" permission, but safety mode is "${mode}".`,
    );
  }
}
