import type { MiddlewareHandler } from "astro";
import { routeWhitelistMiddleware } from "./route-whitelist";

/**
 * Astro中间件配置
 * 用于处理路由白名单和其他中间件功能
 */

// 导出中间件序列
// 注意：中间件按照数组顺序执行
const middlewareSequence: MiddlewareHandler[] = [
  // 路由白名单中间件 - 首先检查路径是否在白名单中
  routeWhitelistMiddleware,
  
  // 可以在这里添加其他中间件
  // 例如：身份验证、日志记录、缓存等
];

/**
 * 组合中间件函数
 * 将多个中间件组合成一个中间件函数
 */
function composeMiddleware(middlewares: MiddlewareHandler[]): MiddlewareHandler {
  return async (context, next) => {
    let index = -1;
    
    async function dispatch(i: number): Promise<Response> {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      
      const middleware = middlewares[i];
      if (i === middlewares.length) {
        return next();
      }
      
      return middleware(context, () => dispatch(i + 1));
    }
    
    return dispatch(0);
  };
}

// 导出组合后的中间件
export const onRequest = composeMiddleware(middlewareSequence);

// 也可以单独导出每个中间件，以便在其他地方使用
export { routeWhitelistMiddleware };