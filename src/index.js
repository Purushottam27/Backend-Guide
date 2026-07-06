import dotenv from 'dotenv'
import connectDB from './db/connection.js'
import { app } from './app.js'

dotenv.config({
    path:'./.env'
})

connectDB()

app.listen(process.env.PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`);
})
