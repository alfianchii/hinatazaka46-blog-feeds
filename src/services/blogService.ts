import * as cheerio from "cheerio";
import { elementParser, kanjiNameParser } from "../utils/parser";
import { config } from "../config";
import { httpClient } from "../utils/http";
import { notifyToDiscord } from "./discordService";
import { log } from "../utils/logger";
import { generateBlogContent } from "../utils/discord";
import type { Blog, MemberIds } from "../types/app";

export class BlogFetchError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = "BlogFetchError"
  }
}

export const getLatestBlog = async (memberId: number): Promise<Blog> => {
  try {
    const html: string = await httpClient.get(`${config.blog.url}${memberId}`)
    const $: cheerio.CheerioAPI = cheerio.load(html)

    const link: string = elementParser($, memberId, config.blog.entry, true).link!
    const name: string = kanjiNameParser($, memberId, config.blog.author.name)
    const kana: string = elementParser($, memberId, config.blog.author.kana).text
    const title: string = elementParser($, memberId, config.blog.title).text
    const time: string = elementParser($, memberId, config.blog.postedAt).text
    const url: string = new URL(link, config.app.baseUrl).href

    return { id: `${url}`, author: { name, kana }, title, url, time }
  } catch (error: any) {
    if (error instanceof BlogFetchError) throw error
    throw new BlogFetchError(`❌ Member ${memberId}: failed to fetch latest blog`, error)
  }
}

export const blogChecking = async (memberId: number, blogIds: MemberIds): Promise<void> => {
  try {
    const latestBlog: Blog = await getLatestBlog(memberId)

    const prevBlogId = blogIds?.[memberId]
    if (prevBlogId === latestBlog.id) {
      log.info(`Member ${memberId}: no new blog`)
      return
    }

    log.base(`🔔 New blog detected: ${latestBlog.title}`)
    const content = generateBlogContent(latestBlog)
    await notifyToDiscord(content)
    blogIds[memberId] = latestBlog.id
    log.info(`Done checking blog for member ${memberId}`)
  } catch (error: any) {
    log.error(`Failed to process member ${memberId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}