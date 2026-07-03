import type { Request, Response } from 'express';
import { MajorService } from '../services/majorService.js';

export class MajorController {
  // Exibe a listagem de todos os cursos cadastrados
  static async list(req: Request, res: Response) {
    const majors = await MajorService.getAll();
    res.render('majors/list', { 
      majors, 
      userLogged: !!req.session.userId 
    });
  }

  // Renderiza o formulário de criação de curso
  static showCreate(req: Request, res: Response) {
    res.render('majors/create', { userLogged: !!req.session.userId });
  }

  // Salva o novo curso enviado pelo formulário
  static async handleCreate(req: Request, res: Response) {
    const { name, code, description } = req.body;
    await MajorService.create({ name, code, description });
    res.redirect('/majors');
  }

  // 🔥 EXERCÍCIO #14: Trata a exclusão assíncrona disparada por AJAX (POST)
  static async handleDeleteAjax(req: Request, res: Response) {
    const { id } = req.body;
    try {
      await MajorService.delete(id);
      res.status(200).json({ success: true, message: 'Curso deletado com sucesso!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar curso. Há alunos vinculados?' });
    }
  }
}