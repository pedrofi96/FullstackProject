const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/usuarios')
//middleware
const verifyToken = require('../helpers/checkToken')
const getUserByToken = require('../helpers/getUserByToken')
//rota get que recebe ID do usuário para achar o usuário e os dados do mesmo.
router.get("/:id", verifyToken, async (req, res)=>{
  //recebe id do usuario como parametro
  const id = req.params.id;
  try{
    //tenta achar o usuário no banco de dados pelo id
    const user = await User.findOne({_id:id }, { password: 0 })
    //retorna os dados do usuário
    res.json({error: null, user })  
  }catch(err){
    //error caso usuário não seja encontrado
     return res.status(400).json({error: ' Usuário não encontrado.' })
  }
});
// Rota para atualizar o usuário
router.put('/',verifyToken, async(req, res)=>{
  //const token recebe token de autenticação JWT pelo header
  const token = req.header('auth-token');
  //usando token de identificação usa a função getUserByToken para identificar o usuário
  const user = await getUserByToken(token);
  //recebe os requests do body para serem alterados
  const userReqId= req.body.id;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  //Converte o id do usuario para string
  const userId = user._id.toString()
  // checar se o id do tonken é igual id do usuario
  if(userId != userReqId){
    return res.status(400).json({error: "Acesso Negado!"})
  }
  //dados a serem atualizados
  const updateData ={
    name: req.body.name,
    email: req.body.email
  };
  //checar se as senhans estão certas
  if(password != confirmPassword){
    res.status(401).json({error:"As senhas não são iguais."})
  }else if(password == confirmPassword && password != null){
    //criar senha criptografada com Hash:
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt);
    //atualizar a senha:
    updateData.password = passwordHash;
  }
  try{
    //Atualiza os dados no banco de dados:
    const updatedUser = await User.findOneAndUpdate({_id:userId},{$set:updateData},{new: true})
    //resposta de sucesso na atualização
    res.json({error: null, msg: "Usuário atualizado com sucesso!", data: updatedUser})
  }catch(err){
    res.status(400).json({err})

  }
  

});

module.exports = router;