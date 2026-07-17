import { SynologyClient } from "../core/synology-client.js";

export class NoteStationService {
  constructor(private readonly client: SynologyClient) {}

  async listNotebooks() {
    return this.client.callAny([
      { api: "SYNO.NoteStation.Notebook", method: "list", version: 2, session: "NoteStation" },
      { api: "SYNO.NoteStation.Notebook", method: "list", version: 1, session: "NoteStation" },
    ]);
  }

  async searchNotes(query: string, notebookId?: string) {
    return this.client.callAny(
      [
        { api: "SYNO.NoteStation.Note", method: "list", version: 4, session: "NoteStation" },
        { api: "SYNO.NoteStation.Note", method: "search", version: 4, session: "NoteStation" },
      ],
      {
        keyword: query,
        notebook_id: notebookId,
      },
    );
  }

  async getNote(noteId: string) {
    return this.client.callAny([
        { api: "SYNO.NoteStation.Note", method: "get", version: 4, session: "NoteStation" },
        { api: "SYNO.NoteStation.Note", method: "view", version: 4, session: "NoteStation" },
    ], {
      note_id: noteId,
    });
  }

  async createNote(title: string, content: string, notebookId?: string) {
    return this.client.callAny([
      { api: "SYNO.NoteStation.Note", method: "create", version: 4, session: "NoteStation" },
    ], {
      title,
      content,
      notebook_id: notebookId,
    });
  }

  async updateNote(noteId: string, patch: Record<string, unknown>) {
    return this.client.callAny([
      { api: "SYNO.NoteStation.Note", method: "update", version: 4, session: "NoteStation" },
    ], {
      note_id: noteId,
      ...patch,
    });
  }

  async deleteNote(noteId: string) {
    return this.client.callAny([
      { api: "SYNO.NoteStation.Note", method: "delete", version: 4, session: "NoteStation" },
    ], {
      note_id: noteId,
    });
  }
}
