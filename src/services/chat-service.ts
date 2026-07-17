import { UnsupportedTransportError } from "../core/errors.js";
import { HttpClient } from "../core/http-client.js";
import { SynologyClient } from "../core/synology-client.js";
import { SynologyConfig } from "../core/types.js";

export class ChatService {
  private readonly webhookClient?: HttpClient;

  constructor(
    private readonly client: SynologyClient,
    private readonly config: SynologyConfig,
  ) {
    if (config.chatWebhookUrl) {
      this.webhookClient = new HttpClient(config.chatWebhookUrl, config.timeoutMs);
    }
  }

  async listChannels() {
    if (this.config.chatTransport === "private-api") {
      return this.client.callAny([
        { api: "SYNO.Chat.Channel", method: "list", version: 1, session: "Chat" },
        { api: "SYNO.SynologyChat.Channel", method: "list", version: 1, session: "Chat" },
      ]);
    }

    throw new UnsupportedTransportError("Channel listing is only available for private-api chat transport.");
  }

  async listMessages(channelId: string, limit = 50) {
    if (this.config.chatTransport === "private-api") {
      return this.client.callAny([
        { api: "SYNO.Chat.Message", method: "list", version: 1, session: "Chat" },
        { api: "SYNO.SynologyChat.Message", method: "list", version: 1, session: "Chat" },
      ], {
        channel_id: channelId,
        limit,
      });
    }

    throw new UnsupportedTransportError("Message listing is only available for private-api chat transport.");
  }

  async sendMessage(message: string, channelId?: string) {
    if (this.config.chatTransport === "webhook") {
      if (!this.webhookClient) {
        throw new UnsupportedTransportError("SYN_CHAT_WEBHOOK_URL is required for webhook chat transport.");
      }

      return this.webhookClient.request("", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          channel_id: channelId,
        }),
      });
    }

    return this.client.callAny([
      { api: "SYNO.Chat.Message", method: "create", version: 1, session: "Chat" },
      { api: "SYNO.SynologyChat.Message", method: "send", version: 1, session: "Chat" },
    ], {
      channel_id: channelId,
      text: message,
    });
  }
}
