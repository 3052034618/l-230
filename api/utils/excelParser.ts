import * as XLSX from 'xlsx';

export interface InspectionNodeData {
  corridorName: string;
  plannedDate: string;
  priority: 'high' | 'medium' | 'low';
  inspector?: string;
  year?: number;
}

export interface ParsedInspectionExcel {
  year: number;
  yearSource: 'year_column' | 'date_column' | 'default';
  nodes: InspectionNodeData[];
}

const CORRIDOR_NAME_KEYS = ['管廊段', '管廊名称'];
const PLANNED_DATE_KEYS = ['计划日期', '巡检日期'];
const PRIORITY_KEYS = ['优先级', '等级'];
const INSPECTOR_KEYS = ['巡检人', '负责人'];
const YEAR_KEYS = ['年度', '年份', '计划年度', '巡检年度', '年'];

function findColumnKey(headers: string[], keys: string[]): string | undefined {
  return headers.find((h) => keys.includes(h.trim()));
}

function parsePriority(value: string): 'high' | 'medium' | 'low' {
  const v = (value || '').trim();
  if (v === '高' || v === '高中') {
    return 'high';
  }
  if (v === '中' || v === '中低') {
    return 'medium';
  }
  if (v === '低') {
    return 'low';
  }
  return 'medium';
}

function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractionalDay);
  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor(totalSeconds / 60) % 60;
  dateInfo.setHours(hours);
  dateInfo.setMinutes(minutes);
  dateInfo.setSeconds(seconds);
  return dateInfo;
}

function parseDate(value: string | number): string {
  if (typeof value === 'number') {
    const date = excelSerialToDate(value);
    return date.toISOString().split('T')[0];
  }

  const v = (value || '').trim();
  
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    return v.split(' ')[0];
  }
  
  if (/^\d{4}\/\d{2}\/\d{2}/.test(v)) {
    return v.split(' ')[0].replace(/\//g, '-');
  }

  const date = new Date(v);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return v;
}

function parseYear(value: string | number): number | null {
  if (typeof value === 'number') {
    if (value >= 2000 && value <= 2100) {
      return Math.floor(value);
    }
    return null;
  }
  const v = (value || '').trim();
  const match = v.match(/(\d{4})/);
  if (match) {
    const year = parseInt(match[1], 10);
    if (year >= 2000 && year <= 2100) {
      return year;
    }
  }
  return null;
}

function extractYearFromNodes(nodes: InspectionNodeData[]): number {
  for (const node of nodes) {
    if (node.year) {
      return node.year;
    }
    const match = node.plannedDate.match(/^(\d{4})/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return new Date().getFullYear();
}

export function parseInspectionExcel(buffer: Buffer): ParsedInspectionExcel {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
  
  if (jsonData.length < 2) {
    return { year: new Date().getFullYear(), yearSource: 'default', nodes: [] };
  }

  const headers = (jsonData[0] as string[]).map((h) => String(h || '').trim());
  
  const corridorKey = findColumnKey(headers, CORRIDOR_NAME_KEYS);
  const dateKey = findColumnKey(headers, PLANNED_DATE_KEYS);
  const priorityKey = findColumnKey(headers, PRIORITY_KEYS);
  const inspectorKey = findColumnKey(headers, INSPECTOR_KEYS);
  const yearKey = findColumnKey(headers, YEAR_KEYS);

  const nodes: InspectionNodeData[] = [];
  let hasYearColumn = false;

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any[];
    if (!row || row.every((cell) => cell === undefined || cell === null || cell === '')) {
      continue;
    }

    const corridorIdx = corridorKey ? headers.indexOf(corridorKey) : -1;
    const dateIdx = dateKey ? headers.indexOf(dateKey) : -1;
    const priorityIdx = priorityKey ? headers.indexOf(priorityKey) : -1;
    const inspectorIdx = inspectorKey ? headers.indexOf(inspectorKey) : -1;
    const yearIdx = yearKey ? headers.indexOf(yearKey) : -1;

    const corridorName = corridorIdx >= 0 ? String(row[corridorIdx] || '').trim() : '';
    if (!corridorName) {
      continue;
    }

    const plannedDate = dateIdx >= 0 ? parseDate(row[dateIdx]) : '';
    const priority = priorityIdx >= 0 ? parsePriority(String(row[priorityIdx] || '')) : 'medium';
    const inspector = inspectorIdx >= 0 && row[inspectorIdx] ? String(row[inspectorIdx]).trim() : undefined;
    const year = yearIdx >= 0 ? parseYear(row[yearIdx]) : undefined;
    if (year !== undefined && year !== null) {
      hasYearColumn = true;
    }

    nodes.push({
      corridorName,
      plannedDate,
      priority,
      inspector,
      year: year || undefined,
    });
  }

  const year = extractYearFromNodes(nodes);
  const yearSource = hasYearColumn ? 'year_column' : (dateKey ? 'date_column' : 'default');

  return { year, yearSource, nodes };
}
