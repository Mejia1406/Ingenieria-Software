import dotenv from 'dotenv';
import app from './app';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n🚀 ==========================================');
    console.log('✅ TalentTrace Server iniciado correctamente!');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota' })}`);
    console.log('==========================================\n');
    console.log('💡 Ve a http://localhost:5000 para ver el Hola Mundo!');
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    process.exit(0);
});