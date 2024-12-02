const path = require('path');
const decompress = require('decompress');
const unzip = require('unzip-crx-3');

const { validateManifest } = require('./validateManifest/index.js');


const ZIP_SUFFIX = '.zip'
const CRX_SUFFIX = '.crx'
const EXTENSION_PATH = './extensions'

// 提取chrome浏览器插件
const extractExtension = async (extensionPath) => {
  const extname = path.extname(extensionPath);
  const basename = path.basename(extensionPath, extname);
  if (extname === ZIP_SUFFIX) {
    return decompressZip(extensionPath, path.join(EXTENSION_PATH, basename))
  }
  if (extname === CRX_SUFFIX) {
    return decompressCrx(extensionPath, path.join(EXTENSION_PATH, basename))
  }
  
  throw new Error('不允许上传非zip、crx文件');
}

const decompressZip = (src, dest) => {
  return decompress(src, dest)
}

const decompressCrx = (src, dest) => {
  return unzip(src, dest)
}

extractExtension('test.crx').then(() => {
  const flag = validateManifest('./extensions/test/manifest.json')
  console.log('success');
}).catch(err => {
  console.log(err);
})