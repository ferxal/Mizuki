// 检查环境变量是否正确设置
console.log('检查BILIBILI环境变量设置情况:\n');

const envVars = [
  { name: 'BILIBILI_SESSDATA', value: process.env.BILIBILI_SESSDATA },
  { name: 'BILIBILI_CSRF', value: process.env.BILIBILI_CSRF },
  { name: 'BILIBILI_DEDEUSERID', value: process.env.BILIBILI_DEDEUSERID },
  { name: 'BILIBILI_SID', value: process.env.BILIBILI_SID }
];

let allSet = true;

envVars.forEach(envVar => {
  if (envVar.value && envVar.value.length > 0) {
    console.log(`✅ ${envVar.name}: 已设置 (值长度: ${envVar.value.length})`);
  } else {
    console.log(`❌ ${envVar.name}: 未设置`);
    allSet = false;
  }
});

if (!allSet) {
  console.log('\n\x1b[33m⚠️  请设置缺失的环境变量后再运行上传脚本\x1b[0m');
  console.log('\x1b[36m解决方法:\x1b[0m');
  console.log('1. 按照 README-BILIBILI-UPLOAD.md 中的说明获取Cookie信息');
  console.log('2. 编辑 run-upload.bat 或 run-upload.ps1 脚本文件');
  console.log('3. 将 "您的...值" 替换为实际的Cookie值');
  console.log('4. 重新运行脚本');
} else {
  console.log('\n\x1b[32m🎉 所有环境变量均已正确设置!\x1b[0m');
  console.log('\x1b[36m提示:\x1b[0m 如果上传仍然失败，请检查Cookie是否过期');
}