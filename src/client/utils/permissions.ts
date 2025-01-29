import { User } from '../../shared/types/auth';
import { PermissionCheck } from '../../shared/types/rbac';

/**
 * 检查用户是否具有特定权限
 * @param user 用户对象
 * @param check 权限检查对象
 * @returns 是否具有权限
 */
export function hasPermission(user: User | null, check: PermissionCheck): boolean {
  if (!user) return false;

  const permissionKey = `${check.resource}:${check.action}`;
  return user.permissions.includes(permissionKey) || user.permissions.includes(`${check.resource}:manage`);
}

/**
 * 检查用户是否具有特定角色
 * @param user 用户对象
 * @param role 角色名称
 * @returns 是否具有角色
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * 检查用户是否是管理员
 * @param user 用户对象
 * @returns 是否是管理员
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * 检查用户是否具有多个权限中的任意一个
 * @param user 用户对象
 * @param checks 权限检查对象数组
 * @returns 是否具有任意一个权限
 */
export function hasAnyPermission(user: User | null, checks: PermissionCheck[]): boolean {
  return checks.some(check => hasPermission(user, check));
}

/**
 * 检查用户是否具有所有指定的权限
 * @param user 用户对象
 * @param checks 权限检查对象数组
 * @returns 是否具有所有权限
 */
export function hasAllPermissions(user: User | null, checks: PermissionCheck[]): boolean {
  return checks.every(check => hasPermission(user, check));
}

/**
 * 检查用户是否具有多个角色中的任意一个
 * @param user 用户对象
 * @param roles 角色名称数组
 * @returns 是否具有任意一个角色
 */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
  return roles.some(role => hasRole(user, role));
}

/**
 * 检查用户是否具有所有指定的角色
 * @param user 用户对象
 * @param roles 角色名称数组
 * @returns 是否具有所有角色
 */
export function hasAllRoles(user: User | null, roles: string[]): boolean {
  return roles.every(role => hasRole(user, role));
} 