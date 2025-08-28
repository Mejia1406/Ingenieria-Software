import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Verificar que la URI esté presente
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI no está definida en las variables de entorno');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📝 Database: ${conn.connection.name}`);
        console.log(`🌍 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('❌ Error connecting to MongoDB:', error.message);
        } else {
            console.error('❌ Error connecting to MongoDB:', error);
        }
        process.exit(1);
    }
};

export default connectDB;
