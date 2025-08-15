import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares básicos
app.use(helmet({
    contentSecurityPolicy: false, // Permitir estilos inline
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ¡SOLO UNA RUTA! - Hola Mundo estético
app.get('/', (req, res) => {
    const currentTime = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TalentTrace API - ¡Hola Mundo!</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 3rem 2rem;
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                }

                .logo {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    animation: bounce 2s infinite;
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }

                h1 {
                    font-size: 3rem;
                    font-weight: 900;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .subtitle {
                    font-size: 1.3rem;
                    color: #6b7280;
                    margin-bottom: 2rem;
                    font-weight: 400;
                }

                .status {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .status-dot {
                    width: 12px;
                    height: 12px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .info-card {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .info-card h3 {
                    color: #475569;
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.5px;
                }

                .info-card p {
                    color: #1e293b;
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .footer {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    color: #6b7280;
                    font-size: 0.9rem;
                }

                @media (max-width: 768px) {
                    h1 {
                        font-size: 2.5rem;
                    }
                    .subtitle {
                        font-size: 1.1rem;
                    }
                    .container {
                        padding: 2rem 1.5rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🚀</div>
                <h1>¡Hola Mundo!</h1>
                <p class="subtitle">TalentTrace API está ejecutándose exitosamente</p>
                
                <div class="status">
                    <div class="status-dot"></div>
                    <span style="color: #10b981;">Sistema operativo correctamente</span>
                </div>

                <div class="info-grid">
                    <div class="info-card">
                        <h3>Versión</h3>
                        <p>1.0.0</p>
                    </div>
                    <div class="info-card">
                        <h3>Entorno</h3>
                        <p>${process.env.NODE_ENV || 'development'}</p>
                    </div>
                    <div class="info-card">
                        <h3>Puerto</h3>
                        <p>${process.env.PORT || '5000'}</p>
                    </div>
                    <div class="info-card">
                        <h3>Hora servidor</h3>
                        <p>${currentTime}</p>
                    </div>
                </div>

                <div class="footer">
                    <p>🎯 <strong>TalentTrace</strong> - Plataforma de experiencias laborales</p>
                    <p>Desarrollado en Universidad Eafit 🇨🇴</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Middleware global de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

export default app;