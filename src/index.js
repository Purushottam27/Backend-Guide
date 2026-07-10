import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    app.on('error',(error)=>{
      console.error('Express error: ',error)
      throw error
    })
  })
  .catch((error) => {
    console.error("MongoDB Error: ", error);
  });


