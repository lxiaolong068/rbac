export default {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '24h', // Token 过期时间
  bcryptSaltRounds: 10, // 密码加密轮数
}; 