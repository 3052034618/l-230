import * as XLSX from 'xlsx';

export interface InspectionNodeData {
  corridorName: string;
  plannedDate: string;
  priority: 'high' | 'medium' | 'low';
  inspector?: string;
}

export interface ParsedInspectionExcel {
  year: number;
  nodes: InspectionNodeData[];
}

const CORRIDOR_NAME_KEYS = ['管廊段', '管廊名称'];
const PLANNED_DATE_KEYS = ['计划日期', '巡检日期'];
const PRIORITY_KEYS = ['优先级', '等级'];
const INSPECTOR_KEYS = ['巡检人', '负责人'];

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

function extractYear(nodes: InspectionNodeData[]): number {
  for (const node of nodes) {
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
    return { year: new Date().getFullYear(), nodes: [] };
  }

  const headers = (jsonData[0] as string[]).map((h) => String(h || '').trim());
  
  const corridorKey = findColumnKey(headers, CORRIDOR_NAME_KEYS);
  const dateKey = findColumnKey(headers, PLANNED_DATE_KEYS);
  const priorityKey = findColumnKey(headers, PRIORITY_KEYS);
  const inspectorKey = findColumnKey(headers, INSPECTOR_KEYS);

  const nodes: InspectionNodeData[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any[];
    if (!row || row.every((cell) => cell === undefined || cell === null || cell === '')) {
      continue;
    }

    const corridorIdx = corridorKey ? headers.indexOf(corridorKey) : -1;
    const dateIdx = dateKey ? headers.indexOf(dateKey) : -1;
    const priorityIdx = priorityKey ? headers.indexOf(priorityKey) : -1;
    const inspectorIdx = inspectorKey ? headers.indexOf(inspectorKey) : -1;

    const corridorName = corridorIdx >= 0 ? String(row[corridorIdx] || '').trim() : '';
    if (!corridorName) {
      continue;
    }

    const plannedDate = dateIdx >= 0 ? parseDate(row[dateIdx]) : '';
    const priority = priorityIdx >= 0 ? parsePriority(String(row[priorityIdx] || '')) : 'medium';
    const inspector = inspectorIdx >= 0 && row[inspectorIdx] ? String(row[inspectorIdx]).trim() : undefined;

    nodes.push({
      corridorName,
      plannedDate,
      priority,
      inspector,
    });
  }

  const year = extractYear(nodes);

  return { year, nodes };
}
