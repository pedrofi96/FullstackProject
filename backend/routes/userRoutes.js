const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/usuarios')
//middleware
const verifyToken = require('../helpers/checkToken')
const getUserByToken = require('../helpers/getUserByToken')

//rotas 
router.get("/:id", verifyToken, async (req, res)=>{

  const id = req.params.id;

  try{
    const user = await User.findOne({_id:id }, { password: 0 })
    res.json({error: null, user })  
  }catch(err){
     return res.status(400).json({error: ' Usuário não encontrado.' })
  }
});

// atualizar usuario

router.put('/',verifyToken, async(req, res)=>{

  const token = req.header('auth-token');

  const user = await getUserByToken(token);
  const userReqId= req.body.id;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const userId = user._id.toString()
  // checar se o id do tonken é igual id do usuario

  if(userId != userReqId){
    res.status(400).json({error: "Acesso Negado!"})
  }

  const updateData ={
    name: req.body.name,
    email: req.body.email
  };

  

});

module.exports = router;