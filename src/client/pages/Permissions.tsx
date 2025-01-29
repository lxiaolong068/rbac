import { useEffect, useState } from 'react';
import ApiService from '../services/api';

interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await ApiService.getPermissions();
        setPermissions(response);
      } catch (error) {
        console.error('获取权限列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">权限管理</h1>
        <button className="btn btn-primary">添加权限</button>
      </div>

      <div className="bg-card rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">权限名称</th>
              <th className="p-4 text-left">权限代码</th>
              <th className="p-4 text-left">描述</th>
              <th className="p-4 text-left">创建时间</th>
              <th className="p-4 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id} className="border-b">
                <td className="p-4">{permission.name}</td>
                <td className="p-4">{permission.code}</td>
                <td className="p-4">{permission.description}</td>
                <td className="p-4">{new Date(permission.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <button className="btn btn-sm btn-ghost mr-2">编辑</button>
                  <button className="btn btn-sm btn-destructive">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 