import { UnsupportedTransportError } from "../core/errors.js";
import { HttpClient } from "../core/http-client.js";
import { SynologyClient } from "../core/synology-client.js";
import { SynologyConfig } from "../core/types.js";

export class ContainerManagerService {
  private readonly dockerClient?: HttpClient;

  constructor(
    private readonly client: SynologyClient,
    private readonly config: SynologyConfig,
  ) {
    if (config.dockerBaseUrl) {
      this.dockerClient = new HttpClient(config.dockerBaseUrl, config.timeoutMs);
    }
  }

  async listContainers(all = true) {
    if (this.config.containerTransport === "docker" && this.dockerClient) {
      try {
        return await this.dockerClient.request(`/containers/json?all=${String(all)}`);
      } catch {
        return this.listContainersViaPrivateApi(all);
      }
    }

    return this.listContainersViaPrivateApi(all);
  }

  async inspectContainer(containerId: string) {
    if (this.config.containerTransport === "docker" && this.dockerClient) {
      try {
        return await this.dockerClient.request(`/containers/${containerId}/json`);
      } catch {
        return this.inspectContainerViaPrivateApi(containerId);
      }
    }

    return this.inspectContainerViaPrivateApi(containerId);
  }

  async logs(containerId: string, tail = 200) {
    if (this.config.containerTransport === "docker" && this.dockerClient) {
      try {
        return await this.dockerClient.request(
          `/containers/${containerId}/logs?stdout=true&stderr=true&tail=${tail}`,
          { responseType: "text" },
        );
      } catch {
        return this.logsViaPrivateApi(containerId, tail);
      }
    }

    return this.logsViaPrivateApi(containerId, tail);
  }

  async start(containerId: string) {
    if (this.config.containerTransport === "docker" && this.dockerClient) {
      try {
        return await this.dockerClient.request(`/containers/${containerId}/start`, {
          method: "POST",
          responseType: "text",
        });
      } catch {
        return this.startViaPrivateApi(containerId);
      }
    }

    return this.startViaPrivateApi(containerId);
  }

  async stop(containerId: string) {
    if (this.config.containerTransport === "docker" && this.dockerClient) {
      try {
        return await this.dockerClient.request(`/containers/${containerId}/stop`, {
          method: "POST",
          responseType: "text",
        });
      } catch {
        return this.stopViaPrivateApi(containerId);
      }
    }

    return this.stopViaPrivateApi(containerId);
  }

  async restart(containerId: string) {
    if (this.config.containerTransport === "docker" && this.dockerClient) {
      try {
        return await this.dockerClient.request(`/containers/${containerId}/restart`, {
          method: "POST",
          responseType: "text",
        });
      } catch {
        return this.restartViaPrivateApi(containerId);
      }
    }

    return this.restartViaPrivateApi(containerId);
  }

  private listContainersViaPrivateApi(all: boolean) {
    return this.client.callAny([
      { api: "SYNO.Docker.Container", method: "list", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.ContainerManager.Container", method: "list", version: 1, session: "Docker", httpMethod: "POST" },
    ], {
      offset: 0,
      limit: -1,
      type: all ? "all" : "running",
    });
  }

  private inspectContainerViaPrivateApi(containerId: string) {
    return this.client.callAny([
      { api: "SYNO.Docker.Container", method: "get", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.ContainerManager.Container", method: "get", version: 1, session: "Docker", httpMethod: "POST" },
    ], {
      id: containerId,
    });
  }

  private logsViaPrivateApi(containerId: string, tail: number) {
    return this.client.callAny([
      { api: "SYNO.Docker.Container.Log", method: "get", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.Docker.Container", method: "logs", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.ContainerManager.Container", method: "logs", version: 1, session: "Docker", httpMethod: "POST" },
    ], {
      id: containerId,
      tail,
    });
  }

  private startViaPrivateApi(containerId: string) {
    return this.client.callAny([
      { api: "SYNO.Docker.Container", method: "start", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.ContainerManager.Container", method: "start", version: 1, session: "Docker", httpMethod: "POST" },
    ], {
      id: containerId,
    });
  }

  private stopViaPrivateApi(containerId: string) {
    return this.client.callAny([
      { api: "SYNO.Docker.Container", method: "stop", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.ContainerManager.Container", method: "stop", version: 1, session: "Docker", httpMethod: "POST" },
    ], {
      id: containerId,
    });
  }

  private restartViaPrivateApi(containerId: string) {
    return this.client.callAny([
      { api: "SYNO.Docker.Container", method: "restart", version: 1, session: "Docker", httpMethod: "POST" },
      { api: "SYNO.ContainerManager.Container", method: "restart", version: 1, session: "Docker", httpMethod: "POST" },
    ], {
      id: containerId,
    });
  }
}
