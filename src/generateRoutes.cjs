const fs = require('fs');
const path = require('path');
const DIR = '/home/fallingsakura/CodeProgram/Front-End/Apps/Portfolio/FallingWeb/src/components/projects';

let files = fs.readdirSync(DIR);
files = files.filter(file => path.extname(file) === '.vue');

const routes = files.map(file => {
  const name = path.basename(file, '.vue');
  return `{
    path: '/projects/${name.toLowerCase()}',
    name: '${name}',
    component: () => import('../components/projects/${file}'),
  }`;
}).join(',');
const routesString = `export default [${routes}\n]`;
fs.writeFileSync(path.resolve(DIR, '../../data/routes.js'), routesString);