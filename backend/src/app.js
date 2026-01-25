require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

const app = express()

// Middlewares
app.use(express.json({limit: '10kb'}))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(cookieParser())

// Routes
app.use('/api/v1/auth', authRoutes)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(()=> {
  console.log('MongoDB connected Successfully!')
}).catch((err) => {
  console.log('MongoDB connection error: ', err)
})

//  Server 
const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log('Server is running on port:', port)
})
