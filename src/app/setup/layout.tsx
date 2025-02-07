import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '系统初始化向导 - RBAC权限管理系统',
  description: '完成系统初始化配置',
}

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
} 