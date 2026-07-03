require('dotenv').config()
const express = require('express')
require('./src/db')
const propertyRoutes = require('./src/routes/property')
const authRoutes = require('./src/routes/auth')

const app = express()
app.use(express.json())
app.use('/properties', propertyRoutes)
app.use('/auth', authRoutes)

app.listen(3000, () => console.log("Server is running on port 3000"))
