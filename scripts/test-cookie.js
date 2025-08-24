import fetch from 'node-fetch';

// 测试Cookie有效性
async function testCookie(sessdata, csrf, dedeUserID, sid) {
  console.log('🔍 测试Cookie有效性...');
  
  try {
    // 测试获取用户信息
    const response = await fetch('https://api.bilibili.com/x/space/myinfo', {
      headers: {
        'Cookie': `SESSDATA=${encodeURIComponent(sessdata)}; bili_jct=${csrf}; DedeUserID=${dedeUserID}; sid=${sid}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const result = await response.json();
    console.log('📊 API响应:', JSON.stringify(result, null, 2));
    
    if (result.code === 0) {
      console.log('✅ Cookie有效！用户信息:');
      console.log(`   用户名: ${result.data.name}`);
      console.log(`   MID: ${result.data.mid}`);
      return true;
    } else {
      console.log(`❌ Cookie无效: ${result.message}`);
      

      return false;
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return false;
  }
}

// 从命令行参数获取Cookie
const sessdata = process.argv[2];
const csrf = process.argv[3];
const dedeUserID = process.argv[4] || '';
const sid = process.argv[5] || '';

if (!sessdata || !csrf) {
  console.log('使用方法: node test-cookie.js <SESSDATA> <CSRF> [DedeUserID] [sid]');
  console.log('示例: node test-cookie.js your_sessdata_value your_csrf_value your_dedeuserid your_sid');
  process.exit(1);
}

testCookie(sessdata, csrf, dedeUserID, sid);