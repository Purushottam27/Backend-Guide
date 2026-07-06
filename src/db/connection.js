import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import { app } from '../app.js'

// The professional way to connect the database: 
const connectDB = async ()=>{
    try {
        const connectionDB = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        // console.log(connectionDB)
        console.log(`Database connected to HOST: `,connectionDB.connection.host) // from where our database is been hosted

        app.on('error',(error)=>{
            console.error('Express error: ',error)
            throw error
        })
    } catch (error) {
        console.error("Error connection Failed: ",error)
        process.exit(1)
    }
}

export default connectDB