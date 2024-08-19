const router = require("express").Router();
const jwt = require("jsonwebtoken");
const multer = require("multer")
//importando as models de party e usuarios pois as mesmas estaram ligadas.
const Party = require("../models/party")
const User = require("../models/usuarios")
//define aonde vai salvar as fotos
//middlewares  
const verifyToken = require("../helpers/checkToken") //verifica se o token do usuário é valido
const getUserByToken = require('../helpers/getUserByToken') //pega o usuário no banco baseado no token
const diskStorage = require('../helpers/file-storage'); //seta o caminho e como salvar as imagens
const upload = multer({storage:diskStorage}) //usa o diskStorage para salvar as imagens
//get Party
router.get("/", verifyToken, (req, res)=>{
  res.json({msg:"Funcionando"});
});

//metodo post para criar uma festa:
router.post("/" , verifyToken, upload.fields([{name:'photos'}]),async (req, res )=>{
    const title = req.body.title
    const description = req.body.description
    const partyDate = req.body.party_date

  let files = [];

  if(req.files){
    files = req.files.photos;
  }
  if(title == null || description == null || partyDate== null){
    res.status(400).json({error:"Preencha todos os dados de descrição, titulo e data"})
  }
  const token = req.header('auth-token');
  const userByToken = await getUserByToken(token)
  const userId = userByToken._id.toString();
  try{
    const user = await User.findOne({_id: userId})
    //criar array de fotos
    let photos = [];
    if(files && files.length > 0){
      files.forEach((photo, i) => {
        photos[i] = photo.path
      });
    }
    //objeto party com o que sera salvo no banco de dados.
    const party = new Party({
      title: title,
      description: description,
      partyDate : partyDate,
      photos: photos,
      privacy : req.body.privacy,
      userId: user._id.toString()
    })
    try{
      //salvando party no banco
      const newParty = await party.save();
      res.json({error:null, msg:"Evento criado com sucesso", data:newParty})
    }catch(err){
      res.status(400).json({msg:"Erro ao adicionar festa no banco"})
    }
  }catch(err){
    return res.status(400).json({error:"Não foi possivel achar o usuário."})
  }
});
//rota para ver todas as festas publicas
router.get("/all", async( req, res)=>{
  try{
    const parties = await Party.find({privacy:false}).sort([['_id', -1]])
    res.json({error:null, parties:parties});
  }catch(err){
    res.status(400).json({err})
  }
})
//metodo para pegar todas as festas do usuário
router.get("/userparties", verifyToken, async (req, res)=>{
  try{
    const token = req.header('auth-token')
    const user = await getUserByToken(token)
    const userId = user._id.toString();
    const parties = await Party.find({userId: userId})

    res.json({error: null, parties: parties })


  }catch(err){
    return res.status(400).json({err})
  }
});
//metodo para pegar as festas do usuário
router.get('/userParty/:id', verifyToken, async (req, res)=>{
  try{
    const token = req.header('auth-token')
    const user = await getUserByToken(token)
    const userId = user._id.toString()
    const partyId = req.params.id

    const party = await Party.findOne({_id: partyId, userId: userId})

    res.json({error: null, party: party})


  }catch(err){
    return res.status(400).json({err})
  }
});
//pegar festas de forma não autenticada.
router.get('/:id', async (req, res)=>{
  try{
    const id = req.params.id;
    const party = await Party.findOne({_id: id})

    if(party.pravicy === false){
      res.json({error:null, party:party})
    }else{
      const token = req.header('auth-token')
      const user = await getUserByToken(token)
      const userId = user._id.toString()
      const partyUserId = party.userId.toString();

      if(userId == userPartyId){
        return res.json({error: null, party:party})
      }else{
        return res.status(400).json({error:"Acesso negado."})
      }

    }
  }catch(err){
    return res.status(400).json({msg:"Evento não existe"})
  }
});


module.exports = router;