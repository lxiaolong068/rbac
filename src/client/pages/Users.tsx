import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import ApiService, { User, CreateUserData } from '../services/api'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserData>({ username: '', password: '', role: 'user' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await ApiService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await ApiService.createUser(newUser)
      setIsAddModalOpen(false)
      setNewUser({ username: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || '添加用户失败')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('确定要删除这个用户吗？')) {
      return
    }

    try {
      await ApiService.deleteUser(userId)
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">用户</h1>
          <p className="mt-2 text-sm text-gray-700">
            系统中的所有用户列表，包括他们的用户名、角色和创建时间。
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            添加用户
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      用户名
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      角色
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      创建时间
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {user.username}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.role}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          onClick={() => {/* TODO: 实现编辑功能 */}}
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="relative z-10">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">添加新用户</h3>
                    <form onSubmit={handleAddUser} className="mt-5">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="username" className="form-label">
                            用户名
                          </label>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            required
                            className="form-input"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="form-label">
                            密码
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="form-input"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor="role" className="form-label">
                            角色
                          </label>
                          <select
                            id="role"
                            name="role"
                            className="form-input"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          >
                            <option value="user">普通用户</option>
                            <option value="admin">管理员</option>
                          </select>
                        </div>
                      </div>

                      {error && (
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
                        >
                          添加
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 