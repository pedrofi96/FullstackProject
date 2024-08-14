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
    return res.status(400).json({error: "Acesso Negado!"})
  }

  const updateData ={
    name: req.body.name,
    email: req.body.email
  };

  // checar senha

  if(password != confirmPassword){
    return res.status(400).json({error: "Senhas não são iguais"})
  } else if(password == confirmPassword && password != null){
    //criar senha para o banco de dados
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    updateData.password = passwordHash;
  }

  try{
    const updateUser = await User.findOneAndUpdate({_id: userId}, {$set: updateData}, {new: true});
    res.json({error:null, msg: "Usuário atualizado com sucesso!", data: updateUser});
  }catch(err){
    res.status(400).json({err})
  
  }
  

});

module.exports = router;