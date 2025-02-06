import xlsx from 'xlsx';
// import Database from 'better-sqlite3';

const workbook = xlsx.readFile('C:/Users/cazocar/Documents/proyectos/saberes_venv/saberes_nextjs/db/MATRICULAS2025.xlsx');
const sheetName = workbook.SheetNames[11];
const worksheet = workbook.Sheets[sheetName];