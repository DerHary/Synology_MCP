import { SynologyApiError } from "./errors.js";

export interface HttpRequestOptions {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: BodyInit;
  timeoutMs?: number;
  responseType?: "json" | "text";
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeoutMs: number,
  ) {}

  async request(path: string, options: HttpRequestOptions = {}): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? this.defaultTimeoutMs,
    );

    try {
      const response = await fetch(new URL(path, this.baseUrl), {
        method: options.method ?? "GET",
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });

      const responseType = options.responseType ?? "json";
      const payload =
        responseType === "text" ? await response.text() : await response.json().catch(() => null);

      if (!response.ok) {
        throw new SynologyApiError(`HTTP ${response.status} ${response.statusText}`, payload);
      }

      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }
}
