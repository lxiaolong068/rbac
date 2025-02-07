import { NextRequest } from 'next/server';
import { z } from 'zod';
import { compose } from '@/middleware/compose';
import { withValidation, withResponseHandler } from '@/middleware/validation';
import { withErrorHandling } from '@/middleware/error';
import prisma from '@/lib/prisma';

// 创建用户的请求体验证schema
const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.number().optional(),
});

// 查询用户列表的参数验证schema
const getUsersSchema = z.object({
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('10'),
  keyword: z.string().optional(),
});

// GET /api/users - 获取用户列表
export const GET = compose(
  withErrorHandling,
  withValidation(getUsersSchema),
  withResponseHandler
)(async (req: NextRequest) => {
  const { page, pageSize, keyword } = (req as any).validatedData;

  const where = keyword ? {
    OR: [
      { username: { contains: keyword } },
      { email: { contains: keyword } }
    ]
  } : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        username: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return {
    total,
    page,
    pageSize,
    data: users
  };
});

// POST /api/users - 创建用户
export const POST = compose(
  withErrorHandling,
  withValidation(createUserSchema),
  withResponseHandler
)(async (req: NextRequest) => {
  const data = (req as any).validatedData;

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: data.password, // 注意：实际使用时需要先加密密码
      roleId: data.roleId
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: {
        select: {
          id: true,
          name: true
        }
      },
      createdAt: true
    }
  });

  return user;
}); 