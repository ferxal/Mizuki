import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

// 哔哩哔哩上传配置
// 请设置环境变量而不是直接在代码中填写Cookie信息，以确保安全性
const BILIBILI_CONFIG = {
  uploadUrl: 'https://api.bilibili.com/x/upload/web/image', // 使用正确的上传API端点
  sessdata: process.env.BILIBILI_SESSDATA || '', // 需要有效的SESSDATA Cookie值
  csrf: process.env.BILIBILI_CSRF || '', // 需要有效的bili_jct Cookie值
  dedeUserID: process.env.BILIBILI_DEDEUSERID || '', // 需要有效的DedeUserID Cookie值
  sid: process.env.BILIBILI_SID || '', // 需要有效的sid Cookie值
  proxyPrefix: 'https://proxy.chenhen.top',
  webpSuffix: '@.webp'
};

// 调试配置
const DEBUG_MODE = true; // 设置为false时关闭详细调试信息
const MAX_TEST_IMAGES = 3; // 调试时只处理前几张图片

// 番剧数据API配置
const BANGUMI_CONFIG = {
  uid: 'ferxal987',
  token: 'dDnvFD0jVmqWgaemFAlwedPOiKKBCezTJLv0FGIB',
  baseUrl: 'https://api.bgm.tv/v0'
};

// 缓存文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.join(__dirname, '../.bangumi-cache.json');

/**
 * 下载图片到临时文件
 */
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
      
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

/**
 * 上传图片到哔哩哔哩
 */


async function uploadToBilibili(imagePath) {
  
  if (DEBUG_MODE) {
    console.log('📤 开始上传到哔哩哔哩...');
  }
  
  const form = new FormData();
  
  form.append('file', fs.createReadStream(imagePath));
  form.append('bucket', 'openplatform');
  form.append('dir', '');
  form.append('csrf', BILIBILI_CONFIG.csrf);
  
  const headers = {
     'Cookie': `SESSDATA=${encodeURIComponent(BILIBILI_CONFIG.sessdata)}; bili_jct=${BILIBILI_CONFIG.csrf}; DedeUserID=${BILIBILI_CONFIG.dedeUserID}; sid=${BILIBILI_CONFIG.sid}`, 
     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
     'Referer': 'https://member.bilibili.com/',
     'Origin': 'https://member.bilibili.com/',
     'X-CSRF-Token': BILIBILI_CONFIG.csrf,
     ...form.getHeaders()
   };
    
    if (DEBUG_MODE) {
      console.log('📋 请求头信息:');
      console.log(`   Cookie: SESSDATA=${BILIBILI_CONFIG.sessdata.substring(0, 8)}...; bili_jct=${BILIBILI_CONFIG.csrf}; DedeUserID=${BILIBILI_CONFIG.dedeUserID}; sid=${BILIBILI_CONFIG.sid}`);
      console.log(`   Referer: ${headers.Referer}`);
      console.log(`   Origin: ${headers.Origin}`);
    }
  
  return new Promise((resolve, reject) => {
    const req = https.request(BILIBILI_CONFIG.uploadUrl, {
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0) {
            resolve(result.data.image_url);
          } else {
            reject(new Error(`上传失败: ${result.message}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    
    // 添加错误响应处理
    req.on('response', (res) => {
      if (DEBUG_MODE) {
        console.log(`📥 收到响应: ${res.statusCode}`);
        console.log(`📋 响应头:`, JSON.stringify(res.headers, null, 2));
      }
      
      if (res.statusCode !== 200) {
        console.error(`❌ 哔哩哔哩API响应状态: ${res.statusCode}`);
        
        // 收集响应体
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          console.error(`❌ 错误响应体:`, errorData);
          reject(new Error(`上传失败: ${res.statusCode} - ${errorData}`));
        });
      } else {
        // 成功响应也收集数据用于调试
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          if (DEBUG_MODE) {
            console.log(`✅ 上传成功响应:`, responseData);
          }
          try {
            const result = JSON.parse(responseData);
            if (result.code === 0) {
              resolve(result.data.image_url);
            } else {
              reject(new Error(`上传失败: ${result.message}`));
            }
          } catch (e) {
            reject(new Error(`解析响应失败: ${e.message}`));
          }
        });
      }
    });
    
    form.pipe(req);
  });
}

/**
 * 处理哔哩哔哩图片链接
 */
function processBilibiliUrl(originalUrl) {
  // 添加代理前缀和webp后缀
  return `${BILIBILI_CONFIG.proxyPrefix}/${originalUrl}${BILIBILI_CONFIG.webpSuffix}`;
}

/**
 * 获取番剧数据
 */
async function fetchBangumiData() {
  const types = [
    { key: 'watching', type: 3 },
    { key: 'wish', type: 1 },
    { key: 'collect', type: 2 }
  ];
  
  const results = {};
  
  for (const { key, type } of types) {
    try {
      const response = await fetch(
        `${BANGUMI_CONFIG.baseUrl}/users/${BANGUMI_CONFIG.uid}/collections?subject_type=2&type=${type}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${BANGUMI_CONFIG.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`获取${key}数据失败:`, response.status);
        results[key] = [];
        continue;
      }
      
      const data = await response.json();
      results[key] = Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error(`获取${key}数据时出错:`, error.message);
      results[key] = [];
    }
  }
  
  return results;
}

/**
 * 读取缓存
 */
function readCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('读取缓存失败:', error.message);
  }
  return {};
}

/**
 * 写入缓存
 */
function writeCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('写入缓存失败:', error.message);
  }
}

/**
 * 更新anime.astro文件中的图片链接
 */
function updateAnimeFile(imageMap) {
  const animeFilePath = path.join(__dirname, '../src/pages/anime.astro');
  let content = fs.readFileSync(animeFilePath, 'utf8');
  
  let updated = false;
  
  // 更新processImageUrl函数
  const newProcessFunction = `function processImageUrl(url: string): string {
  if (!url || url.includes('/default-image.png')) return url;
  
  // 自动替换为哔哩哔哩图床链接
  const bilibiliMap = ${JSON.stringify(imageMap, null, 2)};
  return bilibiliMap[url] || url;
}`;
  
  content = content.replace(
    /function processImageUrl\(url: string\): string \{[\s\S]*?\}/,
    newProcessFunction
  );
  
  // 检查是否更新成功
  if (content.includes(JSON.stringify(imageMap))) {
    updated = true;
    fs.writeFileSync(animeFilePath, content);
    console.log('✅ anime.astro文件更新成功');
  } else {
    console.log('⚠️  processImageUrl函数未找到，可能需要手动更新');
  }
  
  return updated;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始处理番剧封面...');
  
  // 检查必要的环境变量
  if (!BILIBILI_CONFIG.sessdata || !BILIBILI_CONFIG.csrf || !BILIBILI_CONFIG.dedeUserID || !BILIBILI_CONFIG.sid) {
    console.error('❌ 错误: 请设置有效的BILIBILI环境变量');
    console.error('💡 如何获取Cookie:');
    console.error('   1. 登录B站后，在浏览器开发者工具中查看Cookie');
    console.error('   2. 找到SESSDATA、bili_jct、DedeUserID和sid这四个Cookie的值');
    console.error('   3. 设置环境变量:');
    console.error('      export BILIBILI_SESSDATA=你的SESSDATA值');
    console.error('      export BILIBILI_CSRF=你的bili_jct值');
    console.error('      export BILIBILI_DEDEUSERID=你的DedeUserID值');
    console.error('      export BILIBILI_SID=你的sid值');
    console.error('\n💡 提示: 你也可以使用项目提供的脚本来设置环境变量:');
    console.error('   Windows CMD用户: 运行 scripts/run-upload.bat');
    console.error('   PowerShell用户: 运行 scripts/run-upload.ps1');
    process.exit(1);
  }
  
  if (DEBUG_MODE) {
    console.log('🔧 调试模式已启用');
    console.log(`📊 将只处理前 ${MAX_TEST_IMAGES} 张图片`);
    console.log(`🔑 SESSDATA: ${BILIBILI_CONFIG.sessdata.substring(0, 8)}...`);
    console.log(`🔑 CSRF Token: ${BILIBILI_CONFIG.csrf}`);
    console.log(`🔑 DedeUserID: ${BILIBILI_CONFIG.dedeUserID}`);
    console.log(`🔑 sid: ${BILIBILI_CONFIG.sid}`);
  }
  
  try {
    // 1. 获取番剧数据
    console.log('📡 获取番剧数据...');
    const bangumiData = await fetchBangumiData();
    
    // 2. 读取缓存
    const cache = readCache();
    const imageMap = cache.imageMap || {};
    
    // 3. 收集所有图片URL
    const allImages = new Set();
    
    Object.values(bangumiData).forEach(items => {
      items.forEach(item => {
        const subject = item.subject;
        const images = subject.images || {};
        
        // 按优先级收集图片
        const imageUrl = images.large || images.common || images.medium || images.small || images.grid;
        if (imageUrl && !imageUrl.includes('/default-image.png')) {
          allImages.add(imageUrl);
        }
      });
    });
    
    console.log(`📊 发现 ${allImages.size} 个需要处理的图片`);
    
    // 4. 处理每个图片
    let processedCount = 0;
    const tempDir = path.join(__dirname, '../temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 调试模式下只处理前几张图片
    const imagesToProcess = DEBUG_MODE ? Array.from(allImages).slice(0, MAX_TEST_IMAGES) : Array.from(allImages);
    
    console.log(`🔄 实际处理 ${imagesToProcess.length} 张图片`);
    
    for (const originalUrl of imagesToProcess) {
      // 跳过已处理的图片
      if (imageMap[originalUrl]) {
        processedCount++;
        continue;
      }
      
      try {
        console.log(`🔄 处理图片: ${originalUrl}`);
        
        if (DEBUG_MODE) {
          console.log(`📋 图片URL: ${originalUrl}`);
        }
        
        // 下载图片
        const tempFile = path.join(tempDir, `temp_${Date.now()}.jpg`);
        await downloadImage(originalUrl, tempFile);
        
        // 上传到哔哩哔哩
        const bilibiliUrl = await uploadToBilibili(tempFile);
        
        // 处理链接
        const processedUrl = processBilibiliUrl(bilibiliUrl);
        imageMap[originalUrl] = processedUrl;
        
        console.log(`✅ 上传成功: ${processedUrl}`);
        processedCount++;
        
        // 清理临时文件
        fs.unlinkSync(tempFile);
        
        // 每处理5个图片保存一次缓存
        if (processedCount % 5 === 0) {
          cache.imageMap = imageMap;
          writeCache(cache);
        }
        
        // 避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ 处理图片失败 ${originalUrl}:`, error.message);
      }
    }
    
    // 5. 更新anime.astro文件
    if (Object.keys(imageMap).length > 0) {
      console.log('📝 更新anime.astro文件...');
      updateAnimeFile(imageMap);
    }
    
    // 6. 保存最终缓存
    cache.imageMap = imageMap;
    writeCache(cache);
    
    // 7. 清理临时目录
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    console.log('🎉 处理完成!');
    console.log(`📊 总共处理了 ${processedCount} 个图片`);
    console.log(`💾 缓存已保存到: ${CACHE_FILE}`);
    
  } catch (error) {
    console.error('❌ 处理过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main();