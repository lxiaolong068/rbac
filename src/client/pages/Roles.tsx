import { useEffect, useState } from 'react';
import ApiService from '../services/api';

interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await ApiService.getRoles();
        setRoles(response);
      } catch (error) {
        console.error('获取角色列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">角色管理</h1>
        <button className="btn btn-primary">添加角色</button>
      </div>

      <div className="bg-card rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">角色名称</th>
              <th className="p-4 text-left">描述</th>
              <th className="p-4 text-left">创建时间</th>
              <th className="p-4 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b">
                <td className="p-4">{role.name}</td>
                <td className="p-4">{role.description}</td>
                <td className="p-4">{new Date(role.createdAt).toLocaleDateString()}</td>
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