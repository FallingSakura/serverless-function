const fs = require('fs');
const path = require('path');

const DIR = '/home/fallingsakura/CodeProgram/Front-End/Apps/Portfolio/FallingWeb/src/components/projects';

let files = fs.readdirSync(DIR);
files = files.filter(file => path.extname(file) === '.vue');

const cardList = files.map(file => {
  const name = path.basename(file, '.vue');
  const title = name.replace(/([A-Z])/g, ' $1').trim();
  // 第一：([A-Z])，表示大写字母
  // 第二：$1，表示第一个捕获组的内容
  // 第三：g，表示全局匹配
  // 第四：trim()，表示去掉字符串两端的空白字符
  return `{
    title: '${title}',
    src: '/projects/${name.toLowerCase()}'
  }`;
}).join(',');

const result = `export default [${cardList}\n]`;

fs.writeFileSync(path.join(DIR, '../../data/cardList.js'), result);
