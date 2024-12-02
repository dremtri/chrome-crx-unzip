const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const isGlob = require('is-glob');

const ajv = new Ajv({ allErrors: true, strictTypes: false });
ajv.addFormat('glob-pattern', (data) => {
  // 验证 glob 模式
  return isGlob(data)
});

// 添加自定义格式 "match-pattern"
ajv.addFormat('match-pattern', (data) => {
  // 检查 data 是否匹配特定的正则表达式模式
  const pattern = /^((\*|http|https|file|ftp|chrome-extension):\/\/(\*|(\*\.|[^\/\*]+)?(:\d{1,5})?)(\/.*)?)|urn:(\*|[^\/]+)|<all_urls>$/;
  return pattern.test(data);  // 如果匹配，返回 true，否则返回 false
});

// 添加自定义格式 "content-security-policy"
ajv.addFormat('content-security-policy', (data) => {
  // 简单验证 CSP 的合法性
  // 在此可以编写更复杂的验证逻辑，下面是一个简单的示例验证
  const cspPattern = /^(default-src|script-src|style-src|img-src|connect-src|font-src|object-src|media-src|frame-src|child-src|worker-src|manifest-src|base-uri|form-action|frame-ancestors|navigate-to|report-uri|report-to|upgrade-insecure-requests|block-all-mixed-content|require-sri-for|plugin-types|referrer|expect-ct|feature-policy)\s+[\w\s:\/.-]+(;|$)/g;
  
  // 例如，简单检查 CSP 的格式是否匹配该模式（可以根据需要修改正则表达式）
  return cspPattern.test(data);
});

ajv.addFormat('mime-type', (data) => {
  const mimeTypeRegex = /^(?:application|audio|image|message|model|multipart|text|video)\/[-+.\\w]+$/;
  return mimeTypeRegex.test(data);  // 使用正则表达式来验证 MIME 类型
});

addFormats(ajv);

// 获取 Chrome 扩展 manifest.json 的 JSON Schema
const v2ManifestSchema = require('./manifest-v2.schema.json');
const v3ManifestSchema = require('./manifest-v3.schema.json');
const manifestSchema = require('./manifest.schema.json');

// console.log(v2ManifestSchema)
ajv.addSchema(v2ManifestSchema, 'manifest-v2.schema.json')
ajv.addSchema(v3ManifestSchema, 'manifest-v3.schema.json')
const validate = ajv.compile(manifestSchema);
const validateManifest = (manifestFilePath) => {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestFilePath, 'utf8'));
    const valid = validate(manifest);
    if (!valid) {
      console.error('manifest.json 验证失败:', validate.errors);
    } else {
      console.log('manifest.json 验证成功');
    }
  } catch (error) {
    console.error('读取或解析 manifest.json 文件时出错:', error);
  }
};

module.exports = {
  validateManifest
};