// Script para corregir canonicalUrl incorrectos en posts del blog
// Ejecutar: npx ts-node backend/scripts/fixBlogCanonicals.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BlogPost from '../src/models/BlogPost';

dotenv.config();

async function fixCanonicals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/talenttrace');
    console.log('✅ Conectado a MongoDB');

    // Buscar todos los posts con canonical incorrecto o vacío
    const posts = await BlogPost.find({});
    console.log(`📄 Encontrados ${posts.length} posts en total`);

    let fixed = 0;
    for (const post of posts) {
      const correctCanonical = `https://ingenieria-software-2025.vercel.app/blog/${post.slug}`;
      
      // Si el canonical está vacío, es incorrecto, o apunta a otra URL
      if (!post.canonicalUrl || post.canonicalUrl !== correctCanonical) {
        console.log(`🔧 Corrigiendo: ${post.title}`);
        console.log(`   Antes: ${post.canonicalUrl || '(vacío)'}`);
        console.log(`   Después: ${correctCanonical}`);
        
        post.canonicalUrl = correctCanonical;
        await post.save();
        fixed++;
      }
    }

    console.log(`\n✅ Proceso completado: ${fixed} posts corregidos`);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCanonicals();
