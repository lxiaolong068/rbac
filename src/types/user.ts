export interface User {
  id: string
  email: string
  name: string
  password: string
  roles: UserRole[]
  createdAt: Date
  updatedAt: Date
}

export interface UserRole {
  role: Role
}

export interface Role {
  id: string
  name: string
  permissions: RolePermission[]
}

export interface RolePermission {
  permission: Permission
}

export interface Permission {
  id: string
  name: string
  description?: string
}

export interface UserCreateInput {
  email: string
  password: string
  name: string
  roles?: {
    create: {
      role: {
        connect: {
          name: string
        }
      }
    }
  }
}

export interface UserLoginInput {
  email: string
  password: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
  roles: string[]
  permissions: string[]
} 