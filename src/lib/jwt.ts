import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'

interface TokenPayload {
  id: string
  username: string
  email: string
}

export const signToken = (payload: TokenPayload): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    }

    jwt.sign(payload, JWT_SECRET, options, (err, token) => {
      if (err) reject(err)
      else if (token) resolve(token)
      else reject(new Error('Failed to generate token'))
    })
  })
}

export const verifyToken = (token: string): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    const options: VerifyOptions = {
      algorithms: ['HS256']
    }

    jwt.verify(token, JWT_SECRET, options, (err, decoded) => {
      if (err) reject(err)
      else if (decoded && typeof decoded === 'object')
        resolve(decoded as TokenPayload)
      else reject(new Error('Invalid token payload'))
    })
  })
} 