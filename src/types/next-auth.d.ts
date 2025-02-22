import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      roles: Array<{
        id: string
        name: string
        permissions: Array<{
          id: string
          code: string
          resource: string
          action: string
        }>
      }>
    } & DefaultSession['user']
  }

  interface User {
    id: string
    username: string
    roles: Array<{
      id: string
      name: string
      permissions: Array<{
        id: string
        code: string
        resource: string
        action: string
      }>
    }>
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    roles: Array<{
      id: string
      name: string
      permissions: Array<{
        id: string
        code: string
        resource: string
        action: string
      }>
    }>
  }
} 