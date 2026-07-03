import { Router } from 'express';
import { MainController } from '../controllers/mainController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Rotas Públicas
router.get('/about', MainController.about);
router.get('/lorem/:paragraphs', MainController.lorem);
router.get('/login', MainController.showLogin);
router.post('/login', MainController.handleLogin);
router.get('/signup', MainController.showSignup);
router.post('/signup', MainController.handleSignup);
router.get('/logout', MainController.logout);

// Rotas Privadas (Protegidas por Autenticação)
router.get('/', authMiddleware, MainController.game);
router.get('/ranking', authMiddleware, MainController.ranking);
router.post('/score', authMiddleware, MainController.saveScore);

export { router };