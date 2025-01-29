import { useState, useEffect } from 'react'
import ApiService, { Stats } from '../services/api'

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ApiService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            欢迎使用 RBAC 系统
          </h2>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">总用户数</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.totalUsers}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">总角色数</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.totalRoles}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">总权限数</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.totalPermissions}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">系统说明</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  这是一个基于角色的访问控制（RBAC）系统。系统主要包含以下功能：
                </p>
                <ul className="mt-4 list-disc pl-5 space-y-2">
                  <li>用户管理：创建、编辑、删除用户，分配角色</li>
                  <li>角色管理：创建、编辑、删除角色，分配权限</li>
                  <li>权限管理：创建、编辑、删除权限</li>
                  <li>访问控制：基于用户角色的系统访问控制</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 