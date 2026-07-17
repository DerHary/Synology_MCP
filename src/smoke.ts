import "dotenv/config";
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

type SmokeResult = {
  module: string;
  ok: boolean;
  summary: string;
};

function summarize(value: unknown): string {
  if (value === null || value === undefined) {
    return "empty";
  }

  if (typeof value === "string") {
    return value.length > 200 ? `${value.slice(0, 200)}...` : value;
  }

  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const data = (obj.data ?? obj) as Record<string, unknown>;
    const keys = Object.keys(data).slice(0, 8);
    return keys.length ? `keys=${keys.join(", ")}` : "object";
  }

  return String(value);
}

async function runCheck(module: string, fn: () => Promise<unknown>): Promise<SmokeResult> {
  try {
    const result = await fn();
    return { module, ok: true, summary: summarize(result) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { module, ok: false, summary: message };
  }
}

async function main() {
  const config = loadConfig();
  const client = new SynologyClient(config);
  const dsm = new DsmService(client);
  const files = new FileStationService(client);
  const calendar = new CalendarService(client);
  const notes = new NoteStationService(client);
  const contacts = new ContactsService(client);
  const chat = new ChatService(client, config);
  const downloads = new DownloadStationService(client);
  const containers = new ContainerManagerService(client, config);

  const checks: Array<Promise<SmokeResult>> = [
    runCheck("auth.core_login", async () => {
      await client.ensureLogin("Core");
      return "login ok";
    }),
    runCheck("dsm.apiInfo", () => dsm.apiInfo()),
    runCheck("dsm.systemInfo", () => dsm.systemInfo()),
    runCheck("dsm.packages", () => dsm.packageList()),
    runCheck("dsm.storage", () => dsm.storageInfo()),
    runCheck("files.list", () => files.list("/")),
    runCheck("calendar.calendars", () => calendar.listCalendars()),
    runCheck("notes.notebooks", () => notes.listNotebooks()),
    runCheck("contacts.books", () => contacts.listBooks()),
    runCheck("chat.channels", () => chat.listChannels()),
    runCheck("downloads.tasks", () => downloads.listTasks()),
    runCheck("containers.list", () => containers.listContainers(true)),
  ];

  const results = await Promise.all(checks);
  const failed = results.filter((item) => !item.ok);

  for (const result of results) {
    const status = result.ok ? "OK" : "FAIL";
    console.log(`[${status}] ${result.module}: ${result.summary}`);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
