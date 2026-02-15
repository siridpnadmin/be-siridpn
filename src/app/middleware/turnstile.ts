import { Request, Response, NextFunction } from 'express'

async function verifyTurnstileToken(token: string, remoteIp: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY tidak ditemukan')
    return false
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    })

    const data: any = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Error verifying Turnstile token:', error)
    return false
  }
}

export const turnstile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 👈 Explicit return type
  // Skip jika Turnstile tidak diaktifkan
  if (process.env.TURNSTILE_ENABLED !== 'true') {
    next()
    return // 👈 Return void
  }

  const { turnstileToken } = req.getBody()
  const clientIp = req.getState('clientIp') as string

  // Validasi token ada
  if (!turnstileToken) {
    res.status(400).json({
      success: false,
      message: 'Verifikasi CAPTCHA diperlukan',
    })
    return // 👈 Return void, bukan return res.status()
  }

  // Verifikasi token ke Cloudflare
  const isValid = await verifyTurnstileToken(turnstileToken, clientIp)

  if (!isValid) {
    res.status(400).json({
      success: false,
      message: 'Verifikasi CAPTCHA gagal. Silakan coba lagi.',
    })
    return // 👈 Return void
  }

  // Lanjutkan ke handler berikutnya
  next()
}
