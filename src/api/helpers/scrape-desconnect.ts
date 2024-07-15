import { Page } from 'puppeteer'
import { logger } from '../../utils/logger'
declare global {
  interface Window {
    Store: any
    Stream: any
  }
}
export async function scrapeDesconnected(page: Page): Promise<boolean> {
  let result
  try {
    result = await page.evaluate(() => {
      const scrape = window.Store.State.Socket.on('change:state')
      if (
        scrape.__x_stream === 'DISCONNECTED' &&
        scrape.__x_state === 'CONNECTED'
      ) {
        return true
      } else {
        return false
      }
    })
  } catch (error) {
    logger.error(
      `[scrapeDesconnected] message=${error.message} error=${error.stack}`
    )
  }
  return result
}
