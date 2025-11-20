#!/usr/bin/env node

/**
 * Node.js 版本检查脚本
 * 确保使用 uWebSockets.js 支持的 Node.js 版本
 */

const { version } = process;
const majorVersion = Number.parseInt(version.split('.')[0].replace('v', ''), 10);

const SUPPORTED_VERSIONS = [18, 20, 21, 22];
const RECOMMENDED_VERSION = 22;

console.log('\n🔍 检查 Node.js 版本...');
console.log(`当前版本: ${version}\n`);

if (!SUPPORTED_VERSIONS.includes(majorVersion)) {
  console.error(`❌ 错误: uWebSockets.js 不支持 Node.js v${majorVersion}`);
  console.error(`\n支持的版本: ${SUPPORTED_VERSIONS.join(', ')}`);
  console.error(`推荐版本: v${RECOMMENDED_VERSION}.x (LTS)\n`);
  
  console.log('📖 解决方案:\n');
  console.log('1. 使用 nvm 切换版本:');
  console.log(`   nvm install ${RECOMMENDED_VERSION}`);
  console.log(`   nvm use ${RECOMMENDED_VERSION}\n`);
  
  console.log('2. 或者在项目目录运行:');
  console.log('   nvm use\n');
  
  console.log('3. 重新安装依赖:');
  console.log('   rm -rf node_modules pnpm-lock.yaml');
  console.log('   pnpm install\n');
  
  process.exit(1);
}

console.log('✅ Node.js 版本兼容\n');
process.exit(0);
