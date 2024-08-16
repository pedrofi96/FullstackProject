const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const cors = require('cors')

//rotas
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const partyRouter = require('./routes/partyRoutes')


//config

const dbName = 'partytime';
const port = 3000;

const app = express()

//conexão mongodb
mongoose.connect(
  `mongodb://localhost/${dbName}`
)

//rotas
app.get('/', (req, res)=>{
  res.json({message: "Rota teste!"})
})

//middlewares


app.use(cors());
app.use(express.json());
app.use(express.static('public'));
//atrelar rotas no express
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use("/api/party", partyRouter)



app.listen(port , ()=>{
  console.log(`backend rodando na porta ${port}`)
})