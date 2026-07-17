import { explainSynologyError, SynologyApiError } from "./errors.js";
import { HttpClient } from "./http-client.js";
import { ApiCandidate, ApiCallOptions, JsonMap, SynologyConfig } from "./types.js";

interface AuthState {
  sessions: Map<string, string>;
  synoToken?: string;
}

interface SynologyResponse {
  success?: boolean;
  data?: unknown;
  error?: unknown;
  [key: string]: unknown;
}

export class SynologyClient {
  private readonly httpClient: HttpClient;
  private readonly authState: AuthState = { sessions: new Map() };
  private readonly loginPromises = new Map<string, Promise<void>>();

  constructor(private readonly config: SynologyConfig) {
    if (config.ignoreTls) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    this.httpClient = new HttpClient(config.host, config.timeoutMs);
  }

  async ensureLogin(session = "Core"): Promise<void> {
    if (this.authState.sessions.has(session)) {
      return;
    }

    const existingPromise = this.loginPromises.get(session);
    if (existingPromise) {
      await existingPromise;
      return;
    }

    const promise = this.login(session).finally(() => {
      this.loginPromises.delete(session);
    });
    this.loginPromises.set(session, promise);
    await promise;
  }

  async getApiInfo(): Promise<unknown> {
    return this.rawCall({
      path: "/webapi/query.cgi",
      params: {
        api: "SYNO.API.Info",
        version: 1,
        method: "query",
        query: "all",
      },
      requiresAuth: false,
    });
  }

  async call(
    api: string,
    method: string,
    version: number,
    params: JsonMap = {},
    path?: string,
    session = "Core",
    httpMethod: "GET" | "POST" = "GET",
  ) {
    await this.ensureLogin(session);

    return this.rawCall({
      path: path ?? "/webapi/entry.cgi",
      method: httpMethod,
      session,
      params: {
        api,
        version,
        method,
        ...params,
      },
    });
  }

  async callAny(candidates: ApiCandidate[], params: JsonMap = {}): Promise<unknown> {
    const failures: string[] = [];

    for (const candidate of candidates) {
      try {
        return await this.call(
          candidate.api,
          candidate.method,
          candidate.version,
          params,
          candidate.path,
          candidate.session ?? "Core",
          candidate.httpMethod ?? "GET",
        );
      } catch (error) {
        failures.push(`${candidate.api}.${candidate.method}@v${candidate.version}`);
        if (!(error instanceof SynologyApiError)) {
          throw error;
        }
      }
    }

    throw new SynologyApiError(`All API candidates failed: ${failures.join(", ")}`);
  }

  async apiRequest(path: string, options: ApiCallOptions = {}): Promise<unknown> {
    const session = options.session ?? "Core";
    if (options.requiresAuth !== false) {
      await this.ensureLogin(session);
    }

    const headers: Record<string, string> = {
      ...(options.headers ?? {}),
    };

    const url = new URL(path, this.config.host);
    for (const [key, value] of Object.entries(options.params ?? {})) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    if (this.authState.synoToken && !headers["X-SYNO-TOKEN"]) {
      headers["X-SYNO-TOKEN"] = this.authState.synoToken;
    }

    const sid = this.authState.sessions.get(session);
    if (sid && !url.searchParams.has("_sid")) {
      url.searchParams.set("_sid", sid);
    }

    return this.httpClient.request(url.pathname + url.search, {
      method: options.method,
      body: options.body,
      headers,
      responseType: options.responseType,
    });
  }

  private async login(session: string): Promise<void> {
    const response = (await this.rawCall({
      path: "/webapi/auth.cgi",
      params: {
        api: "SYNO.API.Auth",
        version: 7,
        method: "login",
        account: this.config.username,
        passwd: this.config.password,
        session,
        format: "sid",
        otp_code: this.config.otpCode,
      },
      requiresAuth: false,
    })) as SynologyResponse;

    const data = (response?.data ?? {}) as { sid?: string; synotoken?: string; did?: string };
    if (data.sid) {
      this.authState.sessions.set(session, data.sid);
    }
    this.authState.synoToken = data.synotoken;

    if (!this.authState.sessions.get(session)) {
      throw new SynologyApiError("Login succeeded without session id", response);
    }
  }

  private async rawCall(options: ApiCallOptions): Promise<unknown> {
    const url = new URL(options.path ?? "/webapi/entry.cgi", this.config.host);
    const method = options.method ?? "GET";
    let body = options.body;
    const headers = {
      ...(options.headers ?? {}),
    };

    if (method === "GET") {
      for (const [key, value] of Object.entries(options.params ?? {})) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    } else if (!body) {
      const formBody = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params ?? {})) {
        if (value !== undefined && value !== null) {
          formBody.set(key, String(value));
        }
      }
      body = formBody;
      headers["content-type"] = "application/x-www-form-urlencoded";
    }

    const session = options.session ?? "Core";
    const sid = this.authState.sessions.get(session);
    if (options.requiresAuth !== false && sid) {
      if (method === "GET") {
        if (!url.searchParams.has("_sid")) {
          url.searchParams.set("_sid", sid);
        }
      } else if (body instanceof URLSearchParams && !body.has("_sid")) {
        body.set("_sid", sid);
      }
    }

    const payload = (await this.httpClient.request(url.pathname + url.search, {
      method,
      body,
      headers,
      responseType: options.responseType,
    })) as SynologyResponse;

    if (typeof payload === "object" && payload !== null && "success" in payload && !payload.success) {
      const details = payload.error ?? payload;
      const explanation = explainSynologyError(details);
      const message = explanation
        ? `Synology API call failed: ${explanation}`
        : "Synology API call failed";
      throw new SynologyApiError(message, details);
    }

    return payload;
  }
}
