import type { Blog, GreetingCard } from "../types/app"
import type { DiscordEmbed } from "../types/discord"
import { japaneseTimeStyle } from "./date"

export class DiscordError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = "DiscordError"
  }
}

export const generateBlogContent = (blog: Blog): string => `
# 🐰💭♡ ${blog.author.name} (${blog.author.kana})
💌✨☆ **[${blog.title}](${blog.url})**
📅⏰♫ ${japaneseTimeStyle(blog.time, 9)} (🇯🇵) 〜✧✦〜 ${japaneseTimeStyle(blog.time, 7)} (🇮🇩)
`

export const generateGreetingCardContent = (card: GreetingCard): string => `
# 🎴💭♡ ${card.month}月の挨拶
💌✨☆ **Greeting Card of [${card.author.name} (${card.author.kana})](${card.url})**
`

export const generateGreetingCardEmbeds = (card: GreetingCard): DiscordEmbed[] => ([
  {
    title: `🌸💞 ${card.month}グリーティングカード♡`,
    url: card.url,
    image: { url: card.url },
    color: 0x00AEEF,
  },
])