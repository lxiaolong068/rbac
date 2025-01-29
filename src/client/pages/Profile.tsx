import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileFormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function Profile() {
  const { user, loading, error } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validatePassword = () => {
    if (!formData.currentPassword && (formData.newPassword || formData.confirmNewPassword)) {
      setPasswordError('请输入当前密码');
      return false;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setPasswordError('两次输入的新密码不一致');
      return false;
    }
    if (formData.newPassword && formData.newPassword.length < 8) {
      setPasswordError('新密码长度至少为8个字符');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      // TODO: 实现更新个人资料的逻辑
      setSuccessMessage('个人资料更新成功！');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // 错误处理
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">个人资料</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-foreground">个人信息</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  更新您的个人信息和密码。
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-card space-y-6 sm:p-6">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    )}
                    {passwordError && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{passwordError}</div>
                      </div>
                    )}
                    {successMessage && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">{successMessage}</div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="username" className="form-label">
                        用户名
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="form-label">
                        电子邮箱
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="form-label">
                          当前密码
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="form-label">
                          新密码
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmNewPassword" className="form-label">
                          确认新密码
                        </label>
                        <input
                          type="password"
                          name="confirmNewPassword"
                          id="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-card text-right sm:px-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '保存中...' : '保存更改'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 