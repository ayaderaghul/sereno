import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import entryRoutes from "./routes/entry.routes.js"
import aiRoutes from "./routes/ai.routes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

app.use("/auth", authRoutes)
app.use("/entries", entryRoutes)
app.use("/ai", aiRoutes)
app.get("/health", (req,res) =>{
  res.json({status: "ok"})
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ( ) =>{
  console.log(`Server running on port ${PORT}`)
})