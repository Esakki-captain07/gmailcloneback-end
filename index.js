import express from 'express'
import 'dotenv/config.js'
import routes from './src/router/index.js'
import cors from 'cors'


const PORT = process.env.PORT
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(routes)

app.listen(PORT,()=>console.log(`The Sever is listerning on ${PORT}`))