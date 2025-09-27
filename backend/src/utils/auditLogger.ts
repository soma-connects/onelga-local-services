import fs from 'fs';
import path from 'path';

const logFile = path.join(__dirname, '../../logs/audit.log');

export function logAudit(action: string, userId: string | number, details: Record<string, any>) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
  };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}
