import fs from 'fs'
import { env } from '~/config/env'
import ErrorResponse from '~/lib/http/errors'

const puppeteer = require('puppeteer-core')

type ExportFormat = 'pdf' | 'jpg'

type ExportPageParams = {
  path: string
  format: ExportFormat
  cookieHeader?: string
}

type ExportPageResult = {
  buffer: Buffer
  contentType: string
  extension: ExportFormat
}

const allowedPaths = new Set(['/admin/dashboard', '/admin/stakeholder'])

function normalizePath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const [pathname] = normalizedPath.split('?')

  if (!allowedPaths.has(pathname)) {
    throw new ErrorResponse.Forbidden('Halaman tidak diizinkan untuk export')
  }

  return normalizedPath
}

function getBrowserExecutablePath() {
  const configuredPath = env.PUPPETEER_EXECUTABLE_PATH
  if (configuredPath && fs.existsSync(configuredPath)) return configuredPath

  const candidates = ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome-stable']
  const executablePath = candidates.find((candidate) => fs.existsSync(candidate))

  if (!executablePath) {
    throw new ErrorResponse.InternalServer('Chromium belum tersedia di server')
  }

  return executablePath
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) return null

      return {
        name: part.slice(0, separatorIndex),
        value: part.slice(separatorIndex + 1),
        domain: new URL(env.EXPORT_APP_URL).hostname,
        path: '/',
      }
    })
    .filter((cookie): cookie is { name: string; value: string; domain: string; path: string } => cookie !== null)
}

export default class PageExportService {
  private browser?: any

  private async getBrowser() {
    if (this.browser?.connected) return this.browser

    this.browser = await puppeteer.launch({
      executablePath: getBrowserExecutablePath(),
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=medium',
      ],
    })

    return this.browser
  }

  async exportPage({ path, format, cookieHeader }: ExportPageParams): Promise<ExportPageResult> {
    const normalizedPath = normalizePath(path)
    const exportUrl = new URL(normalizedPath, env.EXPORT_APP_URL).toString()
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    try {
      await page.setViewport({ width: 1440, height: 1600, deviceScaleFactor: 1 })

      const cookies = parseCookies(cookieHeader)
      if (cookies.length > 0) {
        await page.setCookie(...cookies)
      }

      await page.goto(exportUrl, {
        waitUntil: 'networkidle2',
        timeout: 60_000,
      })

      await page.evaluate(
        'document.querySelectorAll("[data-export-ignore=\\"true\\"]").forEach((element) => element.remove())'
      )
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (format === 'pdf') {
        const buffer = Buffer.from(
          await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: {
              top: '10mm',
              right: '10mm',
              bottom: '10mm',
              left: '10mm',
            },
          })
        )

        return {
          buffer,
          contentType: 'application/pdf',
          extension: 'pdf',
        }
      }

      const buffer = Buffer.from(
        await page.screenshot({
          type: 'jpeg',
          quality: 92,
          fullPage: true,
        })
      )

      return {
        buffer,
        contentType: 'image/jpeg',
        extension: 'jpg',
      }
    } finally {
      await page.close()
    }
  }
}
