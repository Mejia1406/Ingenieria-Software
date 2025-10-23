import { Response } from 'express'; 
import { AuthRequest } from '../middleware/auth';
import Groq from 'groq-sdk';
// En las tres primeras lineas se importa express, el autenticador y la ia de groq

// Aca se usa la apikey que cree y esta en .env para iniciar la conexion con groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Aca se dice como van a ser los mensajes del chatbot
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Aca le doy a la ia un contexto de como debe comportarse el chatbot
const SYSTEM_CONTEXT = `Eres un asistente virtual de TalentTrace, una plataforma donde los usuarios pueden:
- Buscar empresas y ver sus calificaciones
- Leer y escribir reviews sobre experiencias laborales
- Compartir experiencias de procesos de reclutamiento
- Obtener información sobre diferentes empresas y roles

Tu tono debe ser profesional pero amigable. Ayuda a los usuarios a:
- Encontrar información sobre empresas
- Entender cómo usar la plataforma
- Responder preguntas sobre procesos de reclutamiento
- Dar consejos generales sobre búsqueda de empleo

Siempre sé útil, conciso y profesional. Si no sabes algo, admítelo en lugar de inventar información.`;

// Aca empieza todo, esta funcion es cuando se envia un mensaje al chatbot
export const chatWithBot = async (req: AuthRequest, res: Response) => {
    // Aca se verifica que el mensaje este bien)
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }


    // No se puede hacer que la ia lea la base de datos, pero se le dice como es las preguntas que puede responder
    const lowerMsg = message.toLowerCase();
    if (
      lowerMsg.includes('cuántas empresas') || lowerMsg.includes('cuantas empresas') || lowerMsg.includes('número de empresas') || lowerMsg.includes('numero de empresas') || lowerMsg.includes('total de empresas')
    ) {
      const Company = require('../models/Company').default;
      const count = await Company.countDocuments();
      return res.json({
        success: true,
        data: {
          response: `Actualmente hay ${count} empresas registradas en la plataforma.`,
          timestamp: new Date().toISOString()
        }
      });
    }
    if (
      lowerMsg.includes('cuántos usuarios') || lowerMsg.includes('cuantos usuarios') || lowerMsg.includes('número de usuarios') || lowerMsg.includes('numero de usuarios') || lowerMsg.includes('total de usuarios')
    ) {
      const User = require('../models/User').default;
      const count = await User.countDocuments();
      return res.json({
        success: true,
        data: {
          response: `Actualmente hay ${count} usuarios registrados en la plataforma.`,
          timestamp: new Date().toISOString()
        }
      });
    }
    if (
      lowerMsg.includes('cuántas reviews') || lowerMsg.includes('cuantas reviews') || lowerMsg.includes('número de reviews') || lowerMsg.includes('numero de reviews') || lowerMsg.includes('total de reviews') || lowerMsg.includes('cuántas reseñas') || lowerMsg.includes('cuantas reseñas') || lowerMsg.includes('número de reseñas') || lowerMsg.includes('numero de reseñas') || lowerMsg.includes('total de reseñas')
    ) {
      const Review = require('../models/Review').default;
      const count = await Review.countDocuments();
      return res.json({
        success: true,
        data: {
          response: `Actualmente hay ${count} reviews (reseñas) publicadas en la plataforma.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    // se hace el historial de mensajes, para que la ia pueda tener contexto de la conversacion
    const messages: Message[] = [
      {
        role: 'system',
        content: SYSTEM_CONTEXT
      }
    ];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    }
    messages.push({
      role: 'user',
      content: message
    });
    // Aca se llama a groq para las respuestas 
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.1-8b-instant', // este es el modelo que usamos
      temperature: 0.7, // la temperature se refiere a que tan creativa es la respuesta
      max_tokens: 1024, // maximo de tokens en la respuesta(o sea que tan larga puede ser)
      top_p: 1, // top_p es otra forma de controlar la creatividad
      stream: false // stream hace que la respuesta se devuelva completa y no en tiempo real
    });
    // Aca se envia la respuesta
    const botResponse = chatCompletion.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
    res.json({
      success: true,
      data: {
        response: botResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    
    // se maneja los posibles errores
    if (error.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del chatbot. Contacta al administrador.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Por favor, intenta de nuevo en unos momentos.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar tu mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// si el usuario pregunta por preguntas sugeridas, se le envian unas predefinidas
export const getSuggestedQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = [
      '¿Cómo puedo escribir una review sobre una empresa?',
      '¿Qué información debo incluir en mi experiencia laboral?',
      '¿Cómo funcionan las calificaciones de empresas?',
      '¿Puedo hacer preguntas sobre procesos de reclutamiento?',
      '¿Cómo encuentro empresas en mi área?',
      'Consejos para entrevistas de trabajo'
    ];

    res.json({
      success: true,
      data: { suggestions }
    });

  } catch (error: any) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias'
    });
  }
};