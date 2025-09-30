/**
 * 路由白名单配置
 * 用于排除不需要被Astro捕获的特定路由
 * 这些路由将直接传递给服务器处理，而不是由Astro的404页面处理
 */

export interface RouteWhitelistConfig {
  /**
   * 需要排除的路由模式列表
   * 支持字符串匹配和正则表达式
   */
  patterns: (string | RegExp)[];
  
  /**
   * 是否启用路由白名单功能
   */
  enabled: boolean;
}

/**
 * 默认路由白名单配置
 * 包含常见的CDN、监控、健康检查等路径
 */
export const defaultRouteWhitelistConfig: RouteWhitelistConfig = {
  enabled: true,
  patterns: [
    // Cloudflare CDN 端点
    "/cdn-cgi/trace",
    "/cdn-cgi/*",
  ]
};

/**
 * 检查路径是否在白名单中
 * @param path 要检查的路径
 * @param config 白名单配置（可选，使用默认配置）
 * @returns 是否在白名单中
 */
export function isPathWhitelisted(path: string, config: RouteWhitelistConfig = defaultRouteWhitelistConfig): boolean {
  if (!config.enabled) {
    return false;
  }
  
  // 标准化路径（移除开头和结尾的斜杠）
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  
  for (const pattern of config.patterns) {
    if (typeof pattern === 'string') {
      // 字符串匹配（支持通配符）
      if (pattern.includes('*')) {
        const regexPattern = pattern
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(normalizedPath)) {
          return true;
        }
      } else if (normalizedPath === pattern) {
        return true;
      }
    } else if (pattern instanceof RegExp) {
      // 正则表达式匹配
      if (pattern.test(normalizedPath)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 获取当前项目的路由白名单配置
 * 可以根据环境变量或项目需求进行自定义
 */
export function getRouteWhitelistConfig(): RouteWhitelistConfig {
  // 这里可以根据环境变量或其他条件返回不同的配置
  return defaultRouteWhitelistConfig;
}