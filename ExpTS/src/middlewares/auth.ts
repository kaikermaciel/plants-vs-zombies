import type { Request, Response, NextFunction } from 'express';

type AuthRequest = Request & { session?: { userId?: string | number } };

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  // Se não estiver logado, redireciona imediatamente para a tela de autenticação
  res.redirect('/login');
};