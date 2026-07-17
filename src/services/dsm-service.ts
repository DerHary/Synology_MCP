import { SynologyClient } from "../core/synology-client.js";

export class DsmService {
  constructor(private readonly client: SynologyClient) {}

  async systemInfo() {
    return this.client.callAny([
      { api: "SYNO.Core.System", method: "info", version: 3, session: "Core" },
      { api: "SYNO.DSM.Info", method: "get", version: 1, session: "Core" },
    ]);
  }

  async packageList() {
    return this.client.callAny([
      { api: "SYNO.Core.Package", method: "list", version: 2, session: "Core" },
      { api: "SYNO.Core.Package", method: "list", version: 1, session: "Core" },
    ]);
  }

  async storageInfo() {
    return this.client.callAny([
      { api: "SYNO.Storage.CGI.Storage", method: "load_info", version: 1, session: "Core" },
      { api: "SYNO.Core.Storage", method: "get", version: 1, session: "Core" },
    ]);
  }

  async apiInfo() {
    return this.client.getApiInfo();
  }
}
