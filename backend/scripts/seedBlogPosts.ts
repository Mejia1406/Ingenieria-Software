// Script para poblar la base de datos con artículos de ejemplo
// Ejecutar desde: backend/scripts/seedBlogPosts.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BlogPost from '../src/models/BlogPost';

dotenv.config();

const samplePosts = [
  {
    title: 'Las 10 Mejores Empresas Tech para Trabajar en Colombia 2025',
    excerpt: 'Descubre cuáles son las empresas tecnológicas más destacadas de Colombia que ofrecen los mejores beneficios, cultura laboral y oportunidades de crecimiento profesional.',
    content: `<h2>Introducción</h2>
<p>El sector tecnológico en Colombia ha experimentado un crecimiento exponencial en los últimos años. Empresas locales e internacionales están estableciendo operaciones en ciudades como Bogotá, Medellín y Cali, creando miles de empleos para profesionales del área.</p>

<h2>Top 10 Empresas</h2>

<h3>1. Mercado Libre Colombia</h3>
<p>La empresa de e-commerce líder en Latinoamérica ofrece excelentes beneficios, trabajo remoto flexible y una cultura de innovación constante.</p>
<p><strong>Beneficios destacados:</strong></p>
<ul>
  <li>Seguro médico premium</li>
  <li>Trabajo 100% remoto</li>
  <li>Días de vacaciones adicionales</li>
  <li>Presupuesto para educación</li>
</ul>

<h3>2. Rappi</h3>
<p>El unicornio colombiano que revolucionó la entrega a domicilio. Gran ambiente de trabajo y oportunidades de crecimiento.</p>

<h3>3. Globant</h3>
<p>Consultora tecnológica argentina con fuerte presencia en Colombia. Proyectos internacionales desafiantes.</p>

<h2>¿Cómo aplicar?</h2>
<p>La mayoría de estas empresas publican sus vacantes en LinkedIn y plataformas especializadas. Te recomendamos:</p>
<ol>
  <li>Mantener tu perfil de LinkedIn actualizado</li>
  <li>Preparar un portafolio con tus mejores proyectos</li>
  <li>Practicar entrevistas técnicas</li>
  <li>Conectar con empleados actuales</li>
</ol>

<h2>Conclusión</h2>
<p>Trabajar en una empresa tech de primer nivel en Colombia es cada vez más accesible. Con las habilidades adecuadas y preparación, puedes acceder a salarios competitivos y excelentes beneficios.</p>`,
    author: {
      name: 'TalentTrace Team',
      avatar: 'https://ui-avatars.com/api/?name=TT&background=4F46E5&color=fff'
    },
    featuredImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
    category: 'company-insights',
    tags: ['empresas', 'colombia', 'tech', 'empleos'],
    status: 'published',
    metaTitle: 'Top 10 Empresas Tech Colombia 2025 - Mejores Lugares para Trabajar',
    metaDescription: 'Conoce las 10 mejores empresas tecnológicas para trabajar en Colombia en 2025. Beneficios, salarios y cultura laboral comparados.',
    metaKeywords: ['empresas tech colombia', 'mejores empresas para trabajar', 'empleos tech colombia', 'startups colombia']
  },
  {
    title: 'Cómo Negociar tu Salario: Guía Completa 2025',
    excerpt: 'Aprende las mejores estrategias para negociar un salario justo y obtener la compensación que mereces en tu próxima oferta laboral.',
    content: `<h2>¿Por qué es importante negociar?</h2>
<p>Muchos profesionales aceptan la primera oferta sin negociar, perdiendo potencialmente miles de dólares al año. La negociación salarial es una habilidad crucial que todos deben dominar.</p>

<h2>Preparación antes de negociar</h2>

<h3>1. Investiga el mercado</h3>
<p>Usa plataformas como Glassdoor, LinkedIn Salary Insights y TalentTrace para conocer los rangos salariales típicos para tu posición en tu ciudad.</p>

<h3>2. Conoce tu valor</h3>
<p>Haz una lista de:</p>
<ul>
  <li>Tus logros cuantificables</li>
  <li>Certificaciones y educación</li>
  <li>Años de experiencia</li>
  <li>Habilidades especializadas</li>
</ul>

<h3>3. Define tu rango</h3>
<p>Establece tres números:</p>
<ul>
  <li><strong>Mínimo aceptable:</strong> Por debajo de esto, rechazas</li>
  <li><strong>Objetivo realista:</strong> Lo que esperas obtener</li>
  <li><strong>Ideal:</strong> Lo mejor posible</li>
</ul>

<h2>Durante la negociación</h2>

<h3>Frases que funcionan:</h3>
<p>"Basándome en mi investigación de mercado y mi experiencia, esperaba un rango de X a Y..."</p>
<p>"¿Hay flexibilidad en el paquete de compensación?"</p>
<p>"¿Podríamos considerar beneficios adicionales como trabajo remoto o días extra de vacaciones?"</p>

<h3>Frases a evitar:</h3>
<p>❌ "Necesito este salario porque tengo deudas"</p>
<p>❌ "Mi amigo gana más que yo"</p>
<p>❌ "Acepto lo que me ofrezcan"</p>

<h2>Más allá del salario base</h2>
<p>No olvides negociar:</p>
<ul>
  <li>Bono de firma</li>
  <li>Bono anual</li>
  <li>Stock options</li>
  <li>Trabajo remoto</li>
  <li>Días de vacaciones</li>
  <li>Presupuesto de educación</li>
  <li>Equipamiento</li>
</ul>

<h2>Errores comunes</h2>
<ol>
  <li>Revelar tu salario actual primero</li>
  <li>Aceptar demasiado rápido</li>
  <li>No pedir tiempo para pensar</li>
  <li>Negociar por email cuando debería ser por teléfono</li>
</ol>

<h2>Conclusión</h2>
<p>La negociación salarial es una conversación profesional, no una confrontación. Practica, prepárate y no tengas miedo de abogar por ti mismo. ¡Mereces un salario justo!</p>`,
    author: {
      name: 'María González',
      avatar: 'https://ui-avatars.com/api/?name=MG&background=10B981&color=fff'
    },
    featuredImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200',
    category: 'salary-trends',
    tags: ['salarios', 'negociación', 'consejos', 'carrera'],
    status: 'published',
    metaTitle: 'Cómo Negociar tu Salario en 2025 - Guía Práctica',
    metaDescription: 'Guía completa para negociar tu salario: estrategias, frases efectivas y errores a evitar. Aumenta tu compensación con estas técnicas probadas.',
    metaKeywords: ['negociar salario', 'aumento salarial', 'consejos negociación', 'salario justo']
  },
  {
    title: 'Red Flags en Entrevistas: Señales de Alerta que No Debes Ignorar',
    excerpt: '¿Cómo identificar una empresa problemática durante el proceso de entrevista? Conoce las señales de alerta más comunes que deberían hacerte reconsiderar una oferta.',
    content: `<h2>Introducción</h2>
<p>No todas las oportunidades laborales son iguales. A veces, durante el proceso de entrevista aparecen señales de alerta que indican problemas en la cultura o gestión de la empresa. Aprende a identificarlas.</p>

<h2>Red Flags durante la entrevista</h2>

<h3>🚩 1. Descripciones vagas del puesto</h3>
<p>Si el entrevistador no puede explicar claramente:</p>
<ul>
  <li>Tus responsabilidades diarias</li>
  <li>Métricas de éxito</li>
  <li>Proyectos específicos</li>
  <li>Estructura del equipo</li>
</ul>
<p>Puede indicar desorganización o que el rol está mal definido.</p>

<h3>🚩 2. Alta rotación de personal</h3>
<p>Preguntas a hacer:</p>
<ul>
  <li>"¿Cuánto tiempo lleva el equipo trabajando junto?"</li>
  <li>"¿Qué pasó con la persona anterior en este rol?"</li>
  <li>"¿Cuál es la tasa de retención del equipo?"</li>
</ul>

<h3>🚩 3. Comportamiento del entrevistador</h3>
<p>Cuidado con:</p>
<ul>
  <li>Llegar tarde sin disculparse</li>
  <li>Interrumpir constantemente</li>
  <li>Ser condescendiente</li>
  <li>No prepararse para la entrevista</li>
  <li>Usar lenguaje inapropiado</li>
</ul>

<h3>🚩 4. Presión para decidir rápido</h3>
<p>"Necesitamos tu respuesta hoy" es una táctica de presión. Las empresas legítimas te dan tiempo razonable.</p>

<h3>🚩 5. Evaden preguntas sobre cultura</h3>
<p>Si no quieren hablar de:</p>
<ul>
  <li>Balance vida-trabajo</li>
  <li>Horarios y flexibilidad</li>
  <li>Políticas de trabajo remoto</li>
  <li>Desarrollo profesional</li>
</ul>
<p>Es una mala señal.</p>

<h2>Red Flags en la oferta</h2>

<h3>🚩 Salario "depende del desempeño"</h3>
<p>El salario base debe ser claro desde el inicio. Bonos variables son diferentes.</p>

<h3>🚩 Contrato confuso o incompleto</h3>
<p>Lee todo antes de firmar. Si algo no está claro, pregunta.</p>

<h3>🚩 Beneficios "en proceso"</h3>
<p>Promesas de beneficios futuros rara vez se materializan.</p>

<h2>Preguntas para detectar problemas</h2>

<ol>
  <li>"¿Cómo describirías la cultura de la empresa?"</li>
  <li>"¿Qué te gusta más y menos de trabajar aquí?"</li>
  <li>"¿Cómo maneja la empresa el burnout?"</li>
  <li>"¿Cuál es el mayor desafío del equipo actualmente?"</li>
  <li>"¿Por qué está vacante esta posición?"</li>
</ol>

<h2>Qué hacer si ves Red Flags</h2>

<h3>Durante el proceso:</h3>
<ul>
  <li>Toma notas de todo lo sospechoso</li>
  <li>Investiga la empresa online (reviews, Glassdoor)</li>
  <li>Habla con empleados actuales/anteriores</li>
  <li>Confía en tu instinto</li>
</ul>

<h3>Si recibes la oferta:</h3>
<ul>
  <li>Pesa los pros y contras</li>
  <li>No tengas miedo de rechazar</li>
  <li>Tu salud mental vale más</li>
  <li>Siempre hay otras oportunidades</li>
</ul>

<h2>Conclusión</h2>
<p>Es mejor rechazar una oferta problemática que arrepentirte después. Las entrevistas son bidireccionales: ellos te evalúan, pero tú también los evalúas a ellos.</p>

<p><strong>Recuerda:</strong> Un trabajo tóxico puede afectar tu salud, relaciones y carrera. No ignores las señales de alerta.</p>`,
    author: {
      name: 'Carlos Rodríguez',
      avatar: 'https://ui-avatars.com/api/?name=CR&background=EF4444&color=fff'
    },
    featuredImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200',
    category: 'interview-tips',
    tags: ['entrevistas', 'red flags', 'consejos', 'cultura laboral'],
    status: 'published',
    metaTitle: 'Red Flags en Entrevistas de Trabajo - Señales de Alerta',
    metaDescription: 'Identifica señales de alerta durante entrevistas laborales. Red flags comunes que indican problemas en la empresa antes de aceptar una oferta.',
    metaKeywords: ['red flags entrevista', 'señales de alerta trabajo', 'mala empresa', 'entrevista trabajo']
  }
];

async function seedBlogPosts() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/talenttrace');
    console.log('✅ Conectado a MongoDB');

    // Limpiar posts existentes (opcional)
    await BlogPost.deleteMany({});
    console.log('🗑️  Posts anteriores eliminados');

    // Insertar posts de ejemplo
    const created = await BlogPost.insertMany(samplePosts);
    console.log(`✅ ${created.length} artículos de blog creados exitosamente`);

    // Mostrar los slugs creados
    created.forEach(post => {
      console.log(`   📝 ${post.title}`);
      console.log(`      → /blog/${post.slug}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Proceso completado. Base de datos desconectada.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
seedBlogPosts();
