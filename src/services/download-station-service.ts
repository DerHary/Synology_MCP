import { SynologyClient } from "../core/synology-client.js";

export class DownloadStationService {
  constructor(private readonly client: SynologyClient) {}

  async listTasks() {
    return this.client.call("SYNO.DownloadStation.Task", "list", 3, {
      additional: JSON.stringify(["detail", "transfer", "file", "tracker", "peer"]),
    }, "/webapi/DownloadStation/task.cgi", "DownloadStation");
  }

  async addTask(uri: string, destination?: string) {
    return this.client.call("SYNO.DownloadStation.Task", "create", 3, {
      uri,
      destination,
    }, "/webapi/DownloadStation/task.cgi", "DownloadStation");
  }

  async pause(taskId: string) {
    return this.client.call("SYNO.DownloadStation.Task", "pause", 3, {
      id: taskId,
    }, "/webapi/DownloadStation/task.cgi", "DownloadStation");
  }

  async resume(taskId: string) {
    return this.client.call("SYNO.DownloadStation.Task", "resume", 3, {
      id: taskId,
    }, "/webapi/DownloadStation/task.cgi", "DownloadStation");
  }

  async delete(taskId: string, forceComplete = false) {
    return this.client.call("SYNO.DownloadStation.Task", "delete", 3, {
      id: taskId,
      force_complete: forceComplete,
    }, "/webapi/DownloadStation/task.cgi", "DownloadStation");
  }
}
