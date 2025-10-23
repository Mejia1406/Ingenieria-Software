import express from 'express';
import Question from '../models/Question';

const router = express.Router();

// se obtiene todas las preguntas con respuestas y autor
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'firstName lastName userType')
      .populate('answers.author', 'firstName lastName userType')
      .sort({ createdAt: -1 });
    res.json({ data: questions });
  } catch (err) {
    res.status(500).json({ error: 'No se pudieron cargar las preguntas.' });
  }
});

//crear nueva pregunta
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;

  const userId = req.body.author || null;
    const question = new Question({ content, author: userId });
    await question.save();
    await question.populate('author', 'firstName lastName userType');
    res.json({ data: question });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo crear la pregunta.' });
  }
});

//agregar respuesta a una pregunta
router.post('/:id/answer', async (req, res) => {
  try {
    const { content } = req.body;
  const userId = req.body.author || null;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Pregunta no encontrada.' });
    question.answers.push({ content, author: userId, createdAt: new Date() });
    await question.save();
    await question.populate('author', 'firstName lastName userType');
    await question.populate('answers.author', 'firstName lastName userType');
    res.json({ data: question });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo agregar la respuesta.' });
  }
});

export default router;
