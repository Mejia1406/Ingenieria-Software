import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Conectar a la base de datos
        await connectDB();
        
        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log('\n🚀 ==========================================');
            console.log('✅ TalentTrace Server iniciado correctamente!');
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota' })}`);
            console.log('==========================================\n');
            console.log('💡 Ve a http://localhost:5000 para ver el Hola Mundo!');
            console.log('🔗 API disponible en http://localhost:5000/api');
            console.log('📚 Endpoints principales:');
            console.log('   • POST /api/auth/register - Registro de usuario');
            console.log('   • POST /api/auth/login - Login de usuario');
            console.log('   • GET /api/companies - Listar empresas');
            console.log('   • GET /api/experiences - Listar experiencias');
            console.log('   • GET /api/health - Estado del servidor\n');
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar el servidor
startServer();

// Manejar cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    process.exit(0);
});