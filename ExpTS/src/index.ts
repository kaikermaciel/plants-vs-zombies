import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './router/router.js';
import { logger } from './middlewares/logger.js';
import validateEnv from './utils/validateEnv.js';
import dotenv from 'dotenv';

dotenv.config();
validateEnv(); // Executa o travamento preventivo do envalid

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração da Engine View Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'main' });

// Middlewares Globais de Parsing e Sessão
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_zombies',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // Sessão válida por 1 dia
}));

// Ativação Obrigatória do Logger (Formato Completo para auditoria)
app.use(logger('completo'));

// Roteamento de Arquivos Estáticos (CSS, Imagens do Jogo)
app.use(express.static(path.join(__dirname, '../public')));

// Acoplamento do Sistema de Rotas MVC
app.use(router);

const PORT = process.env.PORT || 4567;
app.listen(PORT, () => {
  console.log(`🚀 Servidor da UFAM rodando com sucesso em http://localhost:${PORT}`);
});