import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = [
  ['管廊段', '计划日期', '优先级', '巡检人'],
  ['中关村西区综合管廊', '2026-01-15', '高', '王志强'],
  ['CBD东扩管廊工程', '2026-02-01', '中', '李刚'],
  ['陆家嘴金融区管廊', '2026-02-15', '高', '陈晓东'],
  ['浦东新区张江管廊', '2026-03-01', '中', '张伟'],
  ['珠江新城核心区管廊', '2026-03-15', '高', '刘海峰'],
  ['前海自贸区综合管廊', '2026-04-01', '中', '李明华'],
  ['南山科技园管廊', '2026-04-15', '低', '张伟'],
  ['河西新城综合管廊', '2026-05-01', '中', '王磊'],
  ['苏州工业园管廊', '2026-05-15', '低', '赵敏'],
  ['钱江世纪城综合管廊', '2026-06-01', '中', '孙磊'],
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, '巡检计划');

const outputPath = join(__dirname, '..', 'test-inspection-plan.xlsx');
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync(outputPath, buffer);

console.log(`测试Excel文件已生成: ${outputPath}`);
console.log(`共 ${data.length - 1} 条巡检记录`);
