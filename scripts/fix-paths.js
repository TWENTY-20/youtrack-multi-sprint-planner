import fs from 'fs';
import path from 'path';

const filePath = path.resolve('build/widgets/index.html');

let content = fs.readFileSync(filePath, 'utf-8');

// Replace occurrences of "/" with "" in href/src attributes
content = content.replace(/(href|src)="(\/|\.\/)/g, '$1="');

fs.writeFileSync(filePath, content, 'utf-8');

console.log('Fixed paths in index.html');
