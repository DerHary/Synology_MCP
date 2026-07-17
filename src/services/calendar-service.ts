import { SynologyClient } from "../core/synology-client.js";

export class CalendarService {
  constructor(private readonly client: SynologyClient) {}

  async listCalendars() {
    return this.client.call("SYNO.Cal.Cal", "list", 5, {
      cal_type: "all",
    }, undefined, "Calendar", "POST");
  }

  async listEvents(calId: string, start: string, end: string) {
    return this.client.call("SYNO.CAL.Event", "list", 6, {
      cal_id: calId,
      start,
      end,
    }, undefined, "Calendar", "POST");
  }

  async createEvent(calId: string, title: string, start: string, end: string, description?: string) {
    return this.client.call("SYNO.CAL.Event", "create", 6, {
      cal_id: calId,
      title,
      start,
      end,
      description,
    }, undefined, "Calendar", "POST");
  }

  async updateEvent(eventId: string, patch: Record<string, unknown>) {
    return this.client.call("SYNO.CAL.Event", "update", 6, {
      event_id: eventId,
      ...patch,
    }, undefined, "Calendar", "POST");
  }

  async deleteEvent(eventId: string) {
    return this.client.call("SYNO.CAL.Event", "delete", 6, {
      event_id: eventId,
    }, undefined, "Calendar", "POST");
  }

  async listTodos(calId: string) {
    return this.client.call("SYNO.Cal.Todo", "list", 6, {
      cal_id: calId,
    }, undefined, "Calendar", "POST");
  }
}
