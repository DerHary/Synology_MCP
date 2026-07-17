import { z, ZodTypeAny } from "zod";
import { assertSafety } from "../core/safety.js";
import { ModuleName, MutationLevel, SafetyMode } from "../core/types.js";

export interface ToolDefinition<T extends ZodTypeAny = ZodTypeAny> {
  name: string;
  description: string;
  module: ModuleName;
  mutationLevel: MutationLevel;
  inputSchema: T;
  handler: (args: z.infer<T>) => Promise<unknown>;
}

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor(
    private readonly enabledModules: Set<ModuleName>,
    private readonly safetyMode: SafetyMode,
  ) {}

  register<T extends ZodTypeAny>(tool: ToolDefinition<T>): void {
    if (!this.enabledModules.has(tool.module)) {
      return;
    }

    this.tools.set(tool.name, tool as unknown as ToolDefinition);
  }

  list() {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.inputSchema),
    }));
  }

  async call(name: string, args: unknown) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    assertSafety(this.safetyMode, tool.mutationLevel, tool.name);
    const parsed = tool.inputSchema.parse(args ?? {});
    return tool.handler(parsed);
  }
}

function zodToJsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  const shape = schema instanceof z.ZodObject ? schema.shape : {};
  const properties = Object.fromEntries(
    Object.entries(shape).map(([key, value]) => [key, describeZodType(value as ZodTypeAny)]),
  );

  return {
    type: "object",
    properties,
    required: Object.entries(shape)
      .filter(([, value]) => !(value instanceof z.ZodOptional))
      .map(([key]) => key),
    additionalProperties: false,
  };
}

function describeZodType(schema: ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodString) {
    return { type: "string" };
  }
  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }
  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }
  if (schema instanceof z.ZodArray) {
    return { type: "array" };
  }
  if (schema instanceof z.ZodObject) {
    return zodToJsonSchema(schema);
  }
  if (schema instanceof z.ZodOptional) {
    return describeZodType(schema.unwrap());
  }
  return { type: "string" };
}
