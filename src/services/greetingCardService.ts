import * as cheerio from "cheerio";
import { httpClient } from "../utils/http";
import { log } from "../utils/logger";
import { notifyToDiscord } from "./discordService";
import { elementParser, imageSrcParser, kanjiNameParser } from "../utils/parser";
import { config } from "../config";
import { generateGreetingCardContent, generateGreetingCardEmbeds } from "../utils/discord";
import { getCurrentJktMonth, isWithinJktDayRange } from "../utils/date";
import type { GreetingCard, MemberIds } from "../types/app";

export class GreetingCardFetchError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = "GreetingCardFetchError"
  }
}

export const getLatestGreetingCard = async (memberId: number): Promise<GreetingCard> => {
  try {
    const html: string = await httpClient.get(`${config.greetingCard.url}${memberId}`)
    const $: cheerio.CheerioAPI = cheerio.load(html)

    const cardSrc: string = imageSrcParser($, config.greetingCard.card)
    const name: string = kanjiNameParser($, memberId, config.greetingCard.author.name)
    const kana: string = elementParser($, memberId, config.greetingCard.author.kana).text
    const month: number = getCurrentJktMonth()

    return { id: cardSrc, author: { name, kana }, month, url: cardSrc }
  } catch (error: any) {
    if (error instanceof GreetingCardFetchError) throw error
    throw new GreetingCardFetchError(`❌ Member ${memberId}: failed to fetch latest greeting card`, error)
  }
}

export const greetingCardChecking = async (memberId: number, greetingIds: MemberIds): Promise<void> => {
  try {
    if (!isWithinJktDayRange(1, 3)) {
      log.info(`Member ${memberId}: skipped (outside 1–3 JKT)`);
      return;
    }

    const latestGreeting: GreetingCard = await getLatestGreetingCard(memberId)

    const prevGreetingId = greetingIds?.[memberId]
    if (prevGreetingId === latestGreeting.id) {
      log.info(`Member ${memberId}: no new greeting card`)
      return
    }

    log.base(`🔔 New greeting card detected: ${latestGreeting.id}`)
    const content = generateGreetingCardContent(latestGreeting)
    const embeds = generateGreetingCardEmbeds(latestGreeting)
    await notifyToDiscord(content, embeds)
    greetingIds[memberId] = latestGreeting.id
    log.info(`Done checking greeting card for member ${memberId}`)
  } catch (error: any) {
    log.error(`Failed to process member ${memberId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}