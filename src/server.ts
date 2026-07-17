import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./core/config.js";
import { SynologyClient } from "./core/synology-client.js";
import { DsmService } from "./services/dsm-service.js";
import { FileStationService } from "./services/file-station-service.js";
import { CalendarService } from "./services/calendar-service.js";
import { NoteStationService } from "./services/note-station-service.js";
import { ContactsService } from "./services/contacts-service.js";
import { ChatService } from "./services/chat-service.js";
import { DownloadStationService } from "./services/download-station-service.js";
import { ContainerManagerService } from "./services/container-manager-service.js";
import { ToolRegistry } from "./tools/registry.js";
import { registerTools } from "./tools/register-tools.js";

async function main() {
  const config = loadConfig();
  const client = new SynologyClient(config);

  const services = {
    dsm: new DsmService(client),
    files: new FileStationService(client),
    calendar: new CalendarService(client),
    notes: new NoteStationService(client),
    contacts: new ContactsService(client),
    chat: new ChatService(client, config),
    downloads: new DownloadStationService(client),
    containers: new ContainerManagerService(client, config),
  };

  const registry = new ToolRegistry(config.enabledModules, config.safetyMode);
  registerTools(registry, services);

  const server = new Server(
    {
      name: "synology-mixed-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.list(),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await registry.call(request.params.name, request.params.arguments);
      const text =
        typeof result === "string" ? result : JSON.stringify(result, null, 2);

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: message,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
