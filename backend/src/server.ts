import dotenv from 'dotenv';

// Cargar variables de entorno ANTES de importar otros módulos
dotenv.config();

import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Verificar que la URI esté cargada
        console.log('🔹 MONGODB_URI loaded:', !!process.env.MONGODB_URI);
        console.log('🔹 MONGODB_URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
        
        await connectDB();
        
        app.listen(PORT, () => {
            console.log('\n🚀 ==========================================');
            console.log('✅ TalentTrace Server iniciado correctamente!');
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('==========================================\n');
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();