import * as jose from 'jose'

export function getErrorResponse(text: string) {
  return { text }
}

export function isEmailValid(email) {
  const emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
  if (!email) return false

  if (email.length > 254) return false

  var valid = emailRegex.test(email)
  if (!valid) return false

  // Further checking of some things regex can't handle
  var parts = email.split('@')
  if (parts[0].length > 64) return false

  var domainParts = parts[1].split('.')
  if (
    domainParts.some(function (part) {
      return part.length > 63
    })
  )
    return false

  return true
}

export async function getJwt(id: number, name: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.TOKEN_KEY!)
  const alg = 'HS256'

  const jwt = await new jose.SignJWT({ userId: id, name })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('2h')
    .setIssuer('flotischoti')
    .sign(secret)

  return jwt
}

export async function decodeToken(
  token: string
): Promise<jose.JWTPayload | null> {
  const secret = new TextEncoder().encode(process.env.TOKEN_KEY!)

  try {
    const { payload } = await jose.jwtVerify(token, secret)
    console.log('Token verification succeded')
    return payload
  } catch (err) {
    console.log('Token verification failed')
    console.log(err)
    return null
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  const t = await decodeToken(token)
  return t != null
}

export function isValidNumber(metronomeId: String): boolean {
  return metronomeId && !Number.isNaN(Number(metronomeId))
}

export async function getUserAttrFromToken<T = number>(
  token: string | undefined,
  attr: string = 'userId'
): Promise<T | null> {
  if (!token) return null
  const decodedToken = await decodeToken(token)

  return decodedToken ? (decodedToken[attr] as T) : null
}
