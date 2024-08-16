const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/usuarios')

//registrar usuario
router.post('/register', async (req, res)=>{
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if(name == null || email == null || password == null){
    return res.status(400).json({error:'Dados de cadastro invalidos!'})
  }
  if(password != confirmPassword){
    return res.status(400).json({error:'as senhas não são iguais'})
  }

  const emailExists = await User.findOne({email: email})

  if(emailExists){
    return res.status(400).json({error:"Email já cadastrado"})
  }

  //create password
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  const user = new User({
    name: name,
    email: email,
    password: passwordHash
  });

  try{
    const newUser = await user.save();
    //create token
    const token = jwt.sign(
      {
        name:newUser.name,
        id: newUser._id
      },
      "nossosecret"
    );
    //retornar token ao criar usuario
    res.json({error: null, msg:"Você realizou o cadastro com sucesso", token:token, userId:newUser._id})


  }catch(error){
    res.status(400).json({error})
  }

});

// login user

router.post('/login', async(req, res)=>{
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({email: email});
  const checkPassword = await bcrypt.compare(password, user.password);

  //ver se o usuario existe:
  if(!user ){
    return res.status(400).json({message:"Senha ou email inválidos."})
  }

  if(!checkPassword){
    return res.status(400).json({message:"Senha ou email inválidos."})
  }

 
  //create token
  const token = jwt.sign(
    {
      name: user.name,
      id: user.id
    },
    "nossosecret"
  );
  //retornar token ao criar usuario
  res.json({error: null, msg:"Você está autenticado", token:token, userId:user._id})



})

module.exports = router;