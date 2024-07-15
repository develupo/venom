import { Page } from 'puppeteer'
import { logger } from '../../utils/logger'
declare global {
  interface Window {
    pathSession: any
  }
}
export async function scrapeDeleteToken(page: Page): Promise<boolean> {
  let result
  try {
    result = await page.evaluate(() => {
      const scrape = window.pathSession
      if (scrape === true) {
        return true
      } else {
        return false
      }
    })
  } catch (error) {
    logger.error(
      `[scrapeDeleteToken] message=${error.message} error=${error.stack}`
    )
  }
  return result
}
