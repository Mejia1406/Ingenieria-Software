import mongoose from 'mongoose'; // importa mongoose para manejar la conexión a MongoDB

type DbState = { // vea ps, aca se define el estado en el que se encuentra la conexion a la base de datos
    state: string; // aca aparece o "connected" o "disconnected" o "connecting" o "error" o "reconnecting"
    readyState: number; // aca aparece un numero que representa el estado de la conexion (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)
    host?: string; // aca aparece el host al que estamos conectados (normalmente localhost o una URL de MongoDB Atlas) aunque por el ? significa que puede ser undefined
    name?: string; // aca aparece el nombre de la base de datos a la que estamos conectados, aunque por el ? significa que puede ser undefined
    lastError?: string | null; // aca aparece el ultimo error que hubo en la conexion, si es que hubo alguno obvio
    lastConnectedAt?: string | null; // aca aparece la ultima vez que se conecto a la base de datos
    lastDisconnectedAt?: string | null; // aca aparece la ultima vez que se desconecto de la base de datos
    retries?: number; // aca aparece la cantidad de reintentos que se han hecho para conectar a la base de datos
};

const dbState: DbState = { // aca lo que se hace es inicializar el objeto dbState con valores por defecto
    state: 'init', // estado inicial
    readyState: mongoose.connection.readyState, // estado inicial de la conexion (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)
    lastError: null, // no hay error al inicio obvio
    lastConnectedAt: null, // no hay conexion al inicio obvio
    lastDisconnectedAt: null, // no hay desconexion al inicio obvio
    retries: 0
};

// esta funcion devuelve una copia con el fin de que nadie pueda modificar el estado
export const getDbState = () => ({ ...dbState }); 

const log = (msg: string, extra?: any) => { // el log simplemente imprime mensajes en la consola, si se le pasa un segundo parametro lo imprime tambien
    if (extra) console.log(msg, extra); else console.log(msg); // si no hay segundo parametro solo imprime el mensaje
};

const MAX_RETRIES = 5; // este es las veces maximas que se puede intentar conectar a la base de datos si falla
const RETRY_DELAY_BASE = 1500; // este es el tiempo que se espera antes de volver a intentar la conexion

// el async es porque hace cosas asincronas(asincronas son las que tardan un tiempo en completarse, como conectarse a una base de datos o leer un archivo)
async function attemptConnect(attempt = 1): Promise<void> { // esta funcion intenta conectar a la base de datos, si falla lo vuelve a intentar hasta las veces maximas
    if (!process.env.MONGODB_URI) { // si no esta definida la variable de entorno MONGODB_URI (la cual tiene la URL de conexion a la base de datos) lanza un error
        throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }
    try { // entonces esto intenta conectarse a la base de datos
        dbState.retries = attempt - 1; // aca se actualiza la cantidad de reintentos que se han hecho
        log(`🔌 Intentando conectar a MongoDB (intento ${attempt}/${MAX_RETRIES})`); 
        const conn = await mongoose.connect(process.env.MONGODB_URI, { // aqui es donde se conecta a la base de datos
            autoIndex: true, // mongoose aca crea indices para optimizar las consultas
            maxPoolSize: 10, // maximo de conexiones en el pool(el pool es como un conjunto de conexiones que se reutilizan para no tener que abrir y cerrar conexiones constantemente)
            minPoolSize: 1, // minimo de conexiones en el pool
            serverSelectionTimeoutMS: 5000, // tiempo maximo que se espera para seleccionar un servidor
            socketTimeoutMS: 45000 // tiempo maximo que se espera para que una operacion termine
        } as any); // el "as any" es para evitar que typescript se queje por las opciones que no reconoce de mongoose.connect como autoIndex(porque esa es propia de Mongo)
        dbState.state = 'connected'; // entt si se conecta correctamente, actualiza el estado a "connected"
        dbState.readyState = conn.connection.readyState; // actualiza el estado de la conexion
        dbState.host = conn.connection.host; // actualiza el host al que estamos conectados
        dbState.name = conn.connection.name; // actualiza el nombre de la base de datos a la que estamos conectados
        dbState.lastConnectedAt = new Date().toISOString(); // actualiza la ultima vez que se conecto a la base de datos
        log(`MongoDB Connected: ${conn.connection.host}`); // se muestra en consola
        log(`Database: ${conn.connection.name}`); // igual que lo anterior
    } catch (err: any) { // si hay un error al intentar conectarse, entra aca y ps muestra el error en consola
        dbState.lastError = err?.message || String(err);
        dbState.state = 'error';
        console.error(`Error conectando a MongoDB (intento ${attempt}):`, dbState.lastError);
        if (attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY_BASE * attempt;
            log(`Reintentando en ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            return attemptConnect(attempt + 1);
        }
        console.error('Se alcanzó el número máximo de reintentos.');
        throw err;
    }
}

// esto son event listeners para diagnosticar mientras esta corriendo la base de datos y ver en que estado esta
// un evento listener es una funcion que se ejecuta cuando ocurre un evento especifico(ejm: cuando se conecta, cuando se desconecta, cuando hay un error, etc)
mongoose.connection.on('connecting', () => {
    dbState.state = 'connecting';
    dbState.readyState = mongoose.connection.readyState;
    log('MongoDB connecting...');
});

mongoose.connection.on('connected', () => {
    dbState.state = 'connected';
    dbState.readyState = mongoose.connection.readyState;
    dbState.lastConnectedAt = new Date().toISOString();
    log('MongoDB connected.');
});

mongoose.connection.on('reconnected', () => {
    dbState.state = 'reconnected';
    dbState.readyState = mongoose.connection.readyState;
    log('MongoDB reconnected.');
});

mongoose.connection.on('disconnecting', () => {
    dbState.state = 'disconnecting';
    dbState.readyState = mongoose.connection.readyState;
    log('MongoDB disconnecting...');
});

mongoose.connection.on('disconnected', () => {
    dbState.state = 'disconnected';
    dbState.readyState = mongoose.connection.readyState;
    dbState.lastDisconnectedAt = new Date().toISOString();
    log('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
    dbState.state = 'error';
    dbState.readyState = mongoose.connection.readyState;
    dbState.lastError = err.message;
    console.error('MongoDB connection error:', err.message);
});

const connectDB = async () => { // y esto se encarga de iniciar la conexion a la base de datos
    await attemptConnect(); // intenta conectarse a la base de datos 
};

export default connectDB; // y por ultimo se exporta con el nombre connectDB para que pueda ser usado en otros archivos
