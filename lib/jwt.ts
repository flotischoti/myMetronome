import * as jose from 'jose'

export async function getJwt(
  {
    userId,
    name,
    email,
  }: {
    userId: number
    name: string
    email?: string
  },
  expiresIn = '2d',
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.TOKEN_KEY!)
  const alg = 'HS256'

  const jwt = await new jose.SignJWT({ userId, name, email })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('flotischoti')
    .sign(secret)

  return jwt
}

export async function decodeToken(
  token: string,
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

export async function getUserAttrFromToken<T = number>(
  token: string | undefined,
  attr: string = 'userId',
): Promise<T | null> {
  if (!token) return null
  const decodedToken = await decodeToken(token)

  return decodedToken ? (decodedToken[attr] as T) : null
}
