import { config } from "../config";
import type { Blog } from "../types/blog";
import { generateDiscordContent } from "../utils/discord";
import { httpClient } from "../utils/http";
import { log } from "../utils/logger";

export class DiscordNotificationError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = "DiscordNotificationError"
  }
}

export const notifyDiscord = async (blog: Blog): Promise<void> => {
  try {
    const content: string = generateDiscordContent(blog)

    await httpClient.post(config.discord.webhook, { content })

    log.base("📤 Discord notification sent successfully")
  } catch (error: any) {
    if (error instanceof DiscordNotificationError) throw error
    throw new DiscordNotificationError("❌ Failed to send Discord notification", error)
  }
}