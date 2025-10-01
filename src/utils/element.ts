import * as cheerio from "cheerio"
import type { ElementParser } from "../types/app"

export class ParserError extends Error {
	constructor(message: string, public override cause?: unknown) {
		super(message)
		this.name = "ParserError"
	}
}

const getParsedText = (title: string): string => {
	if (!title) throw new ParserError("❌ There was nothing to parse")

	return title
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.join("\n")
}

export const getFirstElement = ($: cheerio.CheerioAPI, memberId: number, identifier: string, isHref: boolean = false): ElementParser => {
	try {
		const element = $(identifier).first()
		if (element.length === 0) throw new ParserError(`❌ Member ${memberId}: no ${identifier} found on the page`)
		const text: string = getParsedText(element.text())

		if (!isHref) return { text }

		const link: string | undefined = element.attr("href")
		if (!link) throw new ParserError(`❌ Member ${memberId}: ${identifier} has no href attribute`)

		return { text, link }
	} catch (error: any) {
		if (error instanceof ParserError) throw error
		throw new ParserError(`❌ Parse Element: failed to parse ${identifier}`, error)
	}
}

export const getElementImageSrc = ($: cheerio.CheerioAPI, identifier: string): string => {
	try {
		const raw = $(identifier)
		if (raw.length === 0) throw new ParserError(`❌ No ${identifier} found on the page`)

		const element = raw.attr("src")
		if (!element) throw new ParserError(`❌ ${identifier} does not have a src attribute`)

		return element
	} catch (error: any) {
		if (error instanceof ParserError) throw error
		throw new ParserError(`❌ Parse Element: failed to parse ${identifier}`, error)
	}
}

export const kanjiNameParser = ($: cheerio.CheerioAPI, memberId: number, identifier: string): string => {
	const element = $(identifier).contents().first()
	if (element.length === 0) throw new ParserError(`❌ Member ${memberId}: no ${identifier} found on the page`)

	return getParsedText(element.text())
}
