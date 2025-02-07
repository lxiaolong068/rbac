import '@testing-library/jest-dom';

// 扩展Jest的匹配器
expect.extend({
  toHaveBeenCalledBefore(received: jest.Mock, other: jest.Mock) {
    const receivedCallTime = received.mock.invocationCallOrder[0];
    const otherCallTime = other.mock.invocationCallOrder[0];

    return {
      pass: receivedCallTime < otherCallTime,
      message: () =>
        `expected ${received.getMockName()} to have been called before ${other.getMockName()}`,
    };
  },
});

// 全局设置
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
  process.env.JWT_SECRET = 'test-secret';
});

// 每个测试后清理
afterEach(() => {
  jest.clearAllMocks();
});

// 所有测试完成后清理
afterAll(() => {
  jest.resetModules();
}); 