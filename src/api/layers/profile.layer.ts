import { Page, Browser } from 'puppeteer'
import { HostLayer } from './host.layer'
import * as path from 'path'
const { exec } = require('child_process')

const fs = require('fs')
import { BASE64_ERROR, base64Management, resizeImg } from '../helpers'
import { CreateConfig } from '../../config/create-config'
import { logger } from '../../utils/logger'

export class ProfileLayer extends HostLayer {
  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    super(browser, page, session, options)
  }

  public async clearToken() {
    await this.page.evaluate(() => {
      localStorage.clear()
      window.location.reload()
    })
  }

  /**
   * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
   * @param time duration of silence
   * @param type kind of silence "hours" "minutes" "year"
   * To remove the silence, just enter the contact parameter
   */
  public async sendMute(
    id: string,
    time: number,
    type: string
  ): Promise<object> {
    let result
    try {
      result = await this.page.evaluate(
        (id, time, type) => WAPI.sendMute(id, time, type),
        id,
        time,
        type
      )
    } catch (error) {
      logger.error(
        `[ProfileLayer - sendMute] message=${error.message} error=${error.stack}`
      )
      throw error
    }
    if (result['erro'] == true) {
      throw new Error(JSON.stringify(result))
    } else {
      return result
    }
  }

  /**
   * Change the theme
   * @param string types "dark" or "light"
   */
  public setTheme(type: string) {
    let result
    try {
      result = this.page.evaluate((type) => WAPI.setTheme(type), type)
    } catch (error) {
      logger.error(
        `[ProfileLayer - setTheme] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Sets current user profile status
   * @param status
   */
  public async setProfileStatus(status: string) {
    let result
    try {
      result = await this.page.evaluate(
        ({ status }) => {
          WAPI.setMyStatus(status)
        },
        { status }
      )
    } catch (error) {
      logger.error(
        `[ProfileLayer - setProfileStatus] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  /**
   * Sets the user's current profile photo
   * @param name
   */
  public async setProfilePic(path: string, to?: string) {
    const base64 = await base64Management.getBase64(path, [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
    ])
    if (base64.error) {
      throw new Error(base64.error.text)
    }
    const buff = Buffer.from(
      base64.data.replace(/^data:image\/(png|jpe?g|webp);base64,/, ''),
      'base64'
    )

    if (!base64.mimeType || base64.mimeType.includes('image')) {
      const _webb64_96 = await resizeImg(buff, { width: 96, height: 96 }),
        _webb64_640 = await resizeImg(buff, { width: 640, height: 640 })
      const obj = { a: _webb64_640, b: _webb64_96 }

      let result
      try {
        result = await this.page.evaluate(
          ({ obj, to }) => WAPI.setProfilePic(obj, to),
          {
            obj,
            to,
          }
        )
      } catch (error) {
        logger.error(
          `[ProfileLayer - setProfilePic result] message=${error.message} error=${error.stack}`
        )
      }
      return result
    } else {
      logger.error(
        `[ProfileLayer - setProfilePic] Not an image, allowed formats png, jpeg and webp`
      )
      throw new Error(BASE64_ERROR.CONTENT_TYPE_NOT_ALLOWED)
    }
  }

  /**
   * Sets current user profile name
   * @param name
   */
  public async setProfileName(name: string) {
    let result
    try {
      result = this.page.evaluate(
        ({ name }) => {
          WAPI.setMyName(name)
        },
        { name }
      )
    } catch (error) {
      logger.error(
        `[ProfileLayer - setProfileName] message=${error.message} error=${error.stack}`
      )
    }
    return result
  }

  public async delProfile() {
    if (!this.page.isClosed()) {
      await this.page
        .evaluate(() => WAPI.logout())
        .catch((error) => {
          logger.error(
            `[ProfileLayer - deProfile WAPI.logout] message=${error.message} error=${error.stack}`
          )
        })
      await this.page.close().catch((error) => {
        logger.error(
          `[ProfileLayer - deProfile page.close] message=${error.message} error=${error.stack}`
        )
      })
      await this.browser.close().catch((error) => {
        logger.error(
          `[ProfileLayer - deProfile WAPI.logout] message=${error.message} error=${error.stack}`
        )
      })
      const folderSession = path.join(
        path.resolve(
          process.cwd(),
          this.options.mkdirFolderToken,
          this.options.folderNameToken,
          this.session
        )
      )
      if (fs.existsSync(folderSession)) {
        try {
          fs.rmSync(folderSession, {
            recursive: true,
            force: true,
          })
        } catch {
          exec(`rm -Rf ${folderSession}`).catch(() => {})
        }
      }
    }
  }
}
