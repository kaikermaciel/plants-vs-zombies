import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { LoremIpsum } from 'lorem-ipsum';
import bcrypt from 'bcryptjs';

type RequestWithSession = Request & { session?: any };

const prisma = new PrismaClient();
const lorem = new LoremIpsum();

export class MainController {
  static about(req: RequestWithSession, res: Response) {
    res.render('about', { userLogged: !!(req.session as any)?.userId });
  }

  // Exercício #6: Rota Geradora Autónoma de Lorem Ipsum
  static lorem(req: Request, res: Response) {
    const paragraphsCount = parseInt(req.params.paragraphs) || 1;
    const paragraphsArray = Array.from({ length: paragraphsCount }, () => lorem.generateParagraphs(1));
    res.render('lorem', { paragraphs: paragraphsArray, userLogged: !!(req.session as any)?.userId });
  }

  static async showSignup(req: Request, res: Response) {
    const majors = await prisma.major.findMany();
    res.render('signup', { majors });
  }

  static async handleSignup(req: Request, res: Response) {
    const { fullname, email, password, majorId } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: { fullname, email, password: hashedPassword, majorId }
      });
      res.redirect('/login');
    } catch (e) {
      res.redirect('/signup?error=email-em-uso');
    }
  }

  static showLogin(req: Request, res: Response) {
    res.render('login');
  }

  static async handleLogin(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      (req.session as any).userId = user.id;
      (req.session as any).userFullname = user.fullname;
      return res.redirect('/');
    }
    res.redirect('/login?error=credenciais-invalidas');
  }

  static game(req: Request, res: Response) {
    res.render('game_wrapper', { 
      layout: 'main', 
      userLogged: true, 
      username: (req.session as any).userFullname 
    });
  }

  // Exercício #16: Endpoint Ajax interceptador de salvamento de Fim de Jogo
  static async saveScore(req: Request, res: Response) {
    const { score } = req.body;
    const userId = (req.session as any).userId;

    if (!userId) return res.sendStatus(401);

    await prisma.gameSession.create({
      data: { userId, score: parseInt(score) || 0 }
    });

    res.sendStatus(201);
  }

  // Exercício #17: Renderizador do Ranking TOP 10 Distintos em Ordem Decrescente
  static async ranking(req: Request, res: Response) {
    const topSessions = await prisma.gameSession.findMany({
      take: 10,
      orderBy: { score: 'desc' },
      include: { user: true }
    });

    res.render('ranking', { sessions: topSessions, userLogged: true });
  }

  static logout(req: Request, res: Response) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}