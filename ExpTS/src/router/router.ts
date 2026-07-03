import { Router } from 'express';
import { MainController } from '../controllers/mainController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { MajorController } from '../controllers/majorController.js';

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

router.get('/majors', authMiddleware, MajorController.list);
router.get('/majors/create', authMiddleware, MajorController.showCreate);
router.post('/majors/create', authMiddleware, MajorController.handleCreate);
router.post('/majors/delete', authMiddleware, MajorController.handleDeleteAjax); 



export { router };