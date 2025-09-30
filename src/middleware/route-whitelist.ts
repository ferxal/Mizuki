import type { MiddlewareHandler } from "astro";
import { isPathWhitelisted, getRouteWhitelistConfig } from "../config/route-whitelist";

/**
 * 路由白名单中间件
 * 用于排除特定路由，使其不被Astro捕获
 */
export const routeWhitelistMiddleware: MiddlewareHandler = async (context, next) => {
  const { url } = context;
  const pathname = url.pathname;
  
  // 检查当前路径是否在白名单中
  const config = getRouteWhitelistConfig();
  
  if (isPathWhitelisted(pathname, config)) {
    // 如果路径在白名单中，直接返回404响应，让服务器处理
    // 这样Astro就不会捕获这些路由，而是让CDN或服务器直接处理
    return new Response(null, {
      status: 404,
      statusText: "Not Found",
      headers: {
        "X-Route-Whitelist": "true",
        "Cache-Control": "no-cache"
      }
    });
  }
  
  // 如果不在白名单中，继续正常处理
  return next();
};

/**
 * 创建路由白名单中间件
 * 可以根据需要配置不同的白名单规则
 */
export function createRouteWhitelistMiddleware(customConfig?: Partial<import("../config/route-whitelist").RouteWhitelistConfig>): MiddlewareHandler {
  return async (context, next) => {
    const { url } = context;
    const pathname = url.pathname;
    
    // 合并配置
    const baseConfig = getRouteWhitelistConfig();
    const config = {
      ...baseConfig,
      ...customConfig
    };
    
    if (isPathWhitelisted(pathname, config)) {
      // 如果路径在白名单中，直接返回404响应
      return new Response(null, {
        status: 404,
        statusText: "Not Found"
      });
    }
    
    return next();
  };
}