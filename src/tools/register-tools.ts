import { z } from "zod";
import { DsmService } from "../services/dsm-service.js";
import { FileStationService } from "../services/file-station-service.js";
import { CalendarService } from "../services/calendar-service.js";
import { NoteStationService } from "../services/note-station-service.js";
import { ContactsService } from "../services/contacts-service.js";
import { ChatService } from "../services/chat-service.js";
import { DownloadStationService } from "../services/download-station-service.js";
import { ContainerManagerService } from "../services/container-manager-service.js";
import { ToolRegistry } from "./registry.js";

const jsonPatchSchema = z.record(z.unknown());

export function registerTools(
  registry: ToolRegistry,
  services: {
    dsm: DsmService;
    files: FileStationService;
    calendar: CalendarService;
    notes: NoteStationService;
    contacts: ContactsService;
    chat: ChatService;
    downloads: DownloadStationService;
    containers: ContainerManagerService;
  },
) {
  registry.register({
    name: "synology_system_info",
    description: "Get Synology DSM system information.",
    module: "dsm",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.dsm.systemInfo(),
  });

  registry.register({
    name: "synology_system_package_list",
    description: "List installed Synology packages.",
    module: "dsm",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.dsm.packageList(),
  });

  registry.register({
    name: "synology_system_storage_info",
    description: "Get Synology storage information.",
    module: "dsm",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.dsm.storageInfo(),
  });

  registry.register({
    name: "synology_system_api_info",
    description: "Return discovered API capabilities from DSM.",
    module: "dsm",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.dsm.apiInfo(),
  });

  registry.register({
    name: "synology_files_list",
    description: "List files and folders in a Synology path.",
    module: "files",
    mutationLevel: "read",
    inputSchema: z.object({ path: z.string() }),
    handler: ({ path }) => services.files.list(path),
  });

  registry.register({
    name: "synology_files_search",
    description: "Search files below a folder path.",
    module: "files",
    mutationLevel: "read",
    inputSchema: z.object({ folderPath: z.string(), pattern: z.string() }),
    handler: ({ folderPath, pattern }) => services.files.search(folderPath, pattern),
  });

  registry.register({
    name: "synology_files_mkdir",
    description: "Create a folder in File Station.",
    module: "files",
    mutationLevel: "mutate",
    inputSchema: z.object({ parentPath: z.string(), name: z.string() }),
    handler: ({ parentPath, name }) => services.files.makeDir(parentPath, name),
  });

  registry.register({
    name: "synology_files_rename",
    description: "Rename a file or folder in File Station.",
    module: "files",
    mutationLevel: "mutate",
    inputSchema: z.object({ path: z.string(), name: z.string() }),
    handler: ({ path, name }) => services.files.rename(path, name),
  });

  registry.register({
    name: "synology_files_copy_move",
    description: "Copy or move files and folders in File Station.",
    module: "files",
    mutationLevel: "mutate",
    inputSchema: z.object({
      sourcePaths: z.array(z.string()).min(1),
      destinationPath: z.string(),
      removeSource: z.boolean().default(false),
    }),
    handler: ({ sourcePaths, destinationPath, removeSource }) =>
      services.files.copyMove(sourcePaths, destinationPath, removeSource),
  });

  registry.register({
    name: "synology_files_delete",
    description: "Delete files or folders in File Station.",
    module: "files",
    mutationLevel: "dangerous",
    inputSchema: z.object({ paths: z.array(z.string()).min(1) }),
    handler: ({ paths }) => services.files.delete(paths),
  });

  registry.register({
    name: "synology_calendar_list_calendars",
    description: "List Synology calendars.",
    module: "calendar",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.calendar.listCalendars(),
  });

  registry.register({
    name: "synology_calendar_list_events",
    description: "List events in a Synology calendar for a date range.",
    module: "calendar",
    mutationLevel: "read",
    inputSchema: z.object({
      calId: z.string(),
      start: z.string(),
      end: z.string(),
    }),
    handler: ({ calId, start, end }) => services.calendar.listEvents(calId, start, end),
  });

  registry.register({
    name: "synology_calendar_create_event",
    description: "Create a Synology calendar event.",
    module: "calendar",
    mutationLevel: "mutate",
    inputSchema: z.object({
      calId: z.string(),
      title: z.string(),
      start: z.string(),
      end: z.string(),
      description: z.string().optional(),
    }),
    handler: ({ calId, title, start, end, description }) =>
      services.calendar.createEvent(calId, title, start, end, description),
  });

  registry.register({
    name: "synology_calendar_update_event",
    description: "Update a Synology calendar event.",
    module: "calendar",
    mutationLevel: "mutate",
    inputSchema: z.object({
      eventId: z.string(),
      patch: jsonPatchSchema,
    }),
    handler: ({ eventId, patch }) => services.calendar.updateEvent(eventId, patch),
  });

  registry.register({
    name: "synology_calendar_delete_event",
    description: "Delete a Synology calendar event.",
    module: "calendar",
    mutationLevel: "dangerous",
    inputSchema: z.object({ eventId: z.string() }),
    handler: ({ eventId }) => services.calendar.deleteEvent(eventId),
  });

  registry.register({
    name: "synology_calendar_list_todos",
    description: "List Synology calendar todos for a calendar.",
    module: "calendar",
    mutationLevel: "read",
    inputSchema: z.object({ calId: z.string() }),
    handler: ({ calId }) => services.calendar.listTodos(calId),
  });

  registry.register({
    name: "synology_notes_list_notebooks",
    description: "List Synology Note Station notebooks.",
    module: "notes",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.notes.listNotebooks(),
  });

  registry.register({
    name: "synology_notes_search",
    description: "Search Synology Note Station notes.",
    module: "notes",
    mutationLevel: "read",
    inputSchema: z.object({
      query: z.string(),
      notebookId: z.string().optional(),
    }),
    handler: ({ query, notebookId }) => services.notes.searchNotes(query, notebookId),
  });

  registry.register({
    name: "synology_notes_get",
    description: "Get a Synology Note Station note by id.",
    module: "notes",
    mutationLevel: "read",
    inputSchema: z.object({ noteId: z.string() }),
    handler: ({ noteId }) => services.notes.getNote(noteId),
  });

  registry.register({
    name: "synology_notes_create",
    description: "Create a Synology Note Station note.",
    module: "notes",
    mutationLevel: "mutate",
    inputSchema: z.object({
      title: z.string(),
      content: z.string(),
      notebookId: z.string().optional(),
    }),
    handler: ({ title, content, notebookId }) =>
      services.notes.createNote(title, content, notebookId),
  });

  registry.register({
    name: "synology_notes_update",
    description: "Update a Synology Note Station note.",
    module: "notes",
    mutationLevel: "mutate",
    inputSchema: z.object({
      noteId: z.string(),
      patch: jsonPatchSchema,
    }),
    handler: ({ noteId, patch }) => services.notes.updateNote(noteId, patch),
  });

  registry.register({
    name: "synology_notes_delete",
    description: "Delete a Synology Note Station note.",
    module: "notes",
    mutationLevel: "dangerous",
    inputSchema: z.object({ noteId: z.string() }),
    handler: ({ noteId }) => services.notes.deleteNote(noteId),
  });

  registry.register({
    name: "synology_contacts_list_books",
    description: "List Synology Contacts address books.",
    module: "contacts",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.contacts.listBooks(),
  });

  registry.register({
    name: "synology_contacts_search",
    description: "Search Synology contacts.",
    module: "contacts",
    mutationLevel: "read",
    inputSchema: z.object({
      query: z.string(),
      addressBookId: z.string().optional(),
    }),
    handler: ({ query, addressBookId }) => services.contacts.search(query, addressBookId),
  });

  registry.register({
    name: "synology_contacts_create",
    description: "Create a Synology contact.",
    module: "contacts",
    mutationLevel: "mutate",
    inputSchema: z.object({ contact: jsonPatchSchema }),
    handler: ({ contact }) => services.contacts.create(contact),
  });

  registry.register({
    name: "synology_contacts_update",
    description: "Update a Synology contact.",
    module: "contacts",
    mutationLevel: "mutate",
    inputSchema: z.object({
      contactId: z.string(),
      patch: jsonPatchSchema,
    }),
    handler: ({ contactId, patch }) => services.contacts.update(contactId, patch),
  });

  registry.register({
    name: "synology_contacts_delete",
    description: "Delete a Synology contact.",
    module: "contacts",
    mutationLevel: "dangerous",
    inputSchema: z.object({ contactId: z.string() }),
    handler: ({ contactId }) => services.contacts.delete(contactId),
  });

  registry.register({
    name: "synology_chat_list_channels",
    description: "List Synology Chat channels.",
    module: "chat",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.chat.listChannels(),
  });

  registry.register({
    name: "synology_chat_list_messages",
    description: "List messages in a Synology Chat channel.",
    module: "chat",
    mutationLevel: "read",
    inputSchema: z.object({
      channelId: z.string(),
      limit: z.number().int().positive().max(200).default(50),
    }),
    handler: ({ channelId, limit }) => services.chat.listMessages(channelId, limit),
  });

  registry.register({
    name: "synology_chat_send_message",
    description: "Send a Synology Chat message.",
    module: "chat",
    mutationLevel: "mutate",
    inputSchema: z.object({
      message: z.string(),
      channelId: z.string().optional(),
    }),
    handler: ({ message, channelId }) => services.chat.sendMessage(message, channelId),
  });

  registry.register({
    name: "synology_downloads_list",
    description: "List Download Station tasks.",
    module: "downloads",
    mutationLevel: "read",
    inputSchema: z.object({}),
    handler: () => services.downloads.listTasks(),
  });

  registry.register({
    name: "synology_downloads_add",
    description: "Add a Download Station task from a URL.",
    module: "downloads",
    mutationLevel: "mutate",
    inputSchema: z.object({
      uri: z.string().url(),
      destination: z.string().optional(),
    }),
    handler: ({ uri, destination }) => services.downloads.addTask(uri, destination),
  });

  registry.register({
    name: "synology_downloads_pause",
    description: "Pause a Download Station task.",
    module: "downloads",
    mutationLevel: "mutate",
    inputSchema: z.object({ taskId: z.string() }),
    handler: ({ taskId }) => services.downloads.pause(taskId),
  });

  registry.register({
    name: "synology_downloads_resume",
    description: "Resume a Download Station task.",
    module: "downloads",
    mutationLevel: "mutate",
    inputSchema: z.object({ taskId: z.string() }),
    handler: ({ taskId }) => services.downloads.resume(taskId),
  });

  registry.register({
    name: "synology_downloads_delete",
    description: "Delete a Download Station task.",
    module: "downloads",
    mutationLevel: "dangerous",
    inputSchema: z.object({
      taskId: z.string(),
      forceComplete: z.boolean().default(false),
    }),
    handler: ({ taskId, forceComplete }) => services.downloads.delete(taskId, forceComplete),
  });

  registry.register({
    name: "synology_containers_list",
    description: "List Synology containers.",
    module: "containers",
    mutationLevel: "read",
    inputSchema: z.object({
      all: z.boolean().default(true),
    }),
    handler: ({ all }) => services.containers.listContainers(all),
  });

  registry.register({
    name: "synology_containers_inspect",
    description: "Inspect a Synology container.",
    module: "containers",
    mutationLevel: "read",
    inputSchema: z.object({ containerId: z.string() }),
    handler: ({ containerId }) => services.containers.inspectContainer(containerId),
  });

  registry.register({
    name: "synology_containers_logs",
    description: "Get logs from a Synology container.",
    module: "containers",
    mutationLevel: "read",
    inputSchema: z.object({
      containerId: z.string(),
      tail: z.number().int().positive().max(1000).default(200),
    }),
    handler: ({ containerId, tail }) => services.containers.logs(containerId, tail),
  });

  registry.register({
    name: "synology_containers_start",
    description: "Start a Synology container.",
    module: "containers",
    mutationLevel: "mutate",
    inputSchema: z.object({ containerId: z.string() }),
    handler: ({ containerId }) => services.containers.start(containerId),
  });

  registry.register({
    name: "synology_containers_stop",
    description: "Stop a Synology container.",
    module: "containers",
    mutationLevel: "dangerous",
    inputSchema: z.object({ containerId: z.string() }),
    handler: ({ containerId }) => services.containers.stop(containerId),
  });

  registry.register({
    name: "synology_containers_restart",
    description: "Restart a Synology container.",
    module: "containers",
    mutationLevel: "dangerous",
    inputSchema: z.object({ containerId: z.string() }),
    handler: ({ containerId }) => services.containers.restart(containerId),
  });
}
