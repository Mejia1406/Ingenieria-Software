import mongoose from 'mongoose';

type DbState = {
    state: string;
    readyState: number;
    host?: string;
    name?: string;
    lastError?: string | null;
    lastConnectedAt?: string | null;
    lastDisconnectedAt?: string | null;
    retries?: number;
};

const dbState: DbState = {
    state: 'init',
    readyState: mongoose.connection.readyState,
    lastError: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    retries: 0
};

export const getDbState = () => ({ ...dbState });

const log = (msg: string, extra?: any) => {
    if (extra) console.log(msg, extra); else console.log(msg);
};

const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 1500; // ms

async function attemptConnect(attempt = 1): Promise<void> {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }
    try {
        dbState.retries = attempt - 1;
        log(`🔌 Intentando conectar a MongoDB (intento ${attempt}/${MAX_RETRIES})`);
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Options (Mongoose 7+ ignores unknown legacy options)
            autoIndex: true,
            maxPoolSize: 10,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        } as any);
        dbState.state = 'connected';
        dbState.readyState = conn.connection.readyState;
        dbState.host = conn.connection.host;
        dbState.name = conn.connection.name;
        dbState.lastConnectedAt = new Date().toISOString();
        log(`📊 MongoDB Connected: ${conn.connection.host}`);
        log(`📝 Database: ${conn.connection.name}`);
    } catch (err: any) {
        dbState.lastError = err?.message || String(err);
        dbState.state = 'error';
        console.error(`❌ Error conectando a MongoDB (intento ${attempt}):`, dbState.lastError);
        if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_BASE * attempt;
            log(`⏳ Reintentando en ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            return attemptConnect(attempt + 1);
        }
        console.error('🚨 Se alcanzó el número máximo de reintentos. Abortando.');
        throw err;
    }
}

// Event listeners para diagnósticos en caliente
mongoose.connection.on('connecting', () => {
    dbState.state = 'connecting';
    dbState.readyState = mongoose.connection.readyState;
    log('🟡 MongoDB connecting...');
});

mongoose.connection.on('connected', () => {
    dbState.state = 'connected';
    dbState.readyState = mongoose.connection.readyState;
    dbState.lastConnectedAt = new Date().toISOString();
    log('🟢 MongoDB connected.');
});

mongoose.connection.on('reconnected', () => {
    dbState.state = 'reconnected';
    dbState.readyState = mongoose.connection.readyState;
    log('🔄 MongoDB reconnected.');
});

mongoose.connection.on('disconnecting', () => {
    dbState.state = 'disconnecting';
    dbState.readyState = mongoose.connection.readyState;
    log('🟠 MongoDB disconnecting...');
});

mongoose.connection.on('disconnected', () => {
    dbState.state = 'disconnected';
    dbState.readyState = mongoose.connection.readyState;
    dbState.lastDisconnectedAt = new Date().toISOString();
    log('🔴 MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
    dbState.state = 'error';
    dbState.readyState = mongoose.connection.readyState;
    dbState.lastError = err.message;
    console.error('💥 MongoDB connection error:', err.message);
});

const connectDB = async () => {
    await attemptConnect();
};

export default connectDB;
