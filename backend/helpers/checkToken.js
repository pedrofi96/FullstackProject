const jwt = require('jsonwebtoken')

const checkToken = (req, res, next)=>{

  const token = req.header('auth-token');

  if(!token){
    return res.status(400).json({error: "Acesso negado!"})
  }


  try{
    const verified = jwt.verify(token, 'nossosecret');
    req.user = verified
    next()
  }catch{
    res.status(400).json({error: 'token inválido'})
  }


}

module.exports = checkToken;