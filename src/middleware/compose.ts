import type { NextRequest } from 'next/server';

type Middleware = (handler: Function) => (req: NextRequest, ...args: any[]) => Promise<any>;

/**
 * 中间件组合器
 * @param middlewares 要组合的中间件数组
 * @returns 组合后的中间件
 */
export function compose(...middlewares: Middleware[]) {
  return function(handler: Function) {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * 使用示例：
 * 
 * ```typescript
 * import { withValidation } from './validation';
 * import { withErrorHandling } from './error';
 * import { withResponseHandler } from './validation';
 * 
 * const schema = z.object({
 *   // 定义验证规则
 * });
 * 
 * export default compose(
 *   withErrorHandling,
 *   withValidation(schema),
 *   withResponseHandler
 * )(async (req) => {
 *   // 处理逻辑
 *   return data;
 * });
 * ```
 */ 