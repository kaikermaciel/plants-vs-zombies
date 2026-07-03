import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export const logger = (format: 'simples' | 'completo') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const logPath = process.env.LOGS_PATH || 'logs/access.log';
    
    // Garante que o diretório de logs exista antes de escrever
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${req.method} ${req.url}`;

    if (format === 'completo') {
      logMessage += ` HTTP/${req.httpVersion} - UserAgent: ${req.get('User-Agent')}`;
    }

    logMessage += '\n';

    fs.appendFile(logPath, logMessage, (err) => {
      if (err) console.error('Falha ao gravar arquivo de log:', err);
    });

    next();
  };
};