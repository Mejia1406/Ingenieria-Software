import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import experienceRoutes from './routes/experiences';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    }
});

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

// Apply rate limiting to API routes
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/experiences', experienceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'TalentTrace API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta principal con información de la API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to TalentTrace API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            companies: '/api/companies',
            experiences: '/api/experiences',
            health: '/api/health'
        },
        documentation: 'https://docs.talenttrace.com'
    });
});

// Mantener la ruta original del "Hola Mundo" estético
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

                .api-endpoints {
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: left;
                }

                .api-endpoints h3 {
                    color: #475569;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .endpoint {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 0.5rem;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 0.9rem;
                }

                .method {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 0.8rem;
                    min-width: 60px;
                    text-align: center;
                }

                .get { background: #d1fae5; color: #059669; }
                .post { background: #dbeafe; color: #2563eb; }

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
                    .endpoint {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 5px;
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

                <div class="api-endpoints">
                    <h3>🔗 Endpoints Disponibles</h3>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span>/api - Información de la API</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span>/api/health - Estado del servidor</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span>/api/auth/register - Registro de usuarios</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span>/api/auth/login - Autenticación</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span>/api/companies - Listar empresas</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span>/api/experiences - Listar experiencias</span>
                    </div>
                </div>

                <div class="footer">
                    <p>🎯 <strong>TalentTrace</strong> - Plataforma de experiencias laborales</p>
                    <p>Desarrollado en Universidad Eafit 🇨🇴</p>
                    <p style="margin-top: 1rem; font-size: 0.8rem;">
                        💡 <strong>Tip:</strong> Visita <a href="/api" style="color: #2563eb;">/api</a> para ver la documentación JSON
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: [
            'GET /api',
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/companies',
            'GET /api/experiences'
        ]
    });
});

// Middleware global de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    // Check if it's an API route
    if (req.path.startsWith('/api/')) {
        return res.status(err.status || 500).json({
            success: false,
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
        });
    }

    // For non-API routes, send HTML error
    res.status(err.status || 500).send(`
        <h1>Error ${err.status || 500}</h1>
        <p>${process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'}</p>
        <a href="/">Volver al inicio</a>
    `);
});

export default app;