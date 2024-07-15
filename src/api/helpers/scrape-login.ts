import { Page } from 'puppeteer'
import { logger } from '../../utils/logger'
export async function scrapeLogin(page: Page): Promise<boolean> {
  let result
  try {
    result = await page.evaluate(() => {
      const count = document.querySelector('._9a59P')
      let data: boolean
      data = false
      if (count != null) {
        const text = count.textContent,
          timeNumber = text.match('Invalid')
        if (timeNumber) {
          data = true
        }
        return data
      }
    })
  } catch (error) {
    logger.error(`[scrapeLogin] message=${error.message} error=${error.stack}`)
  }
  return result
}
