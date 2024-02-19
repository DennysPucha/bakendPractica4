var express = require('express');
var router = express.Router();
let jwt =require('jsonwebtoken');
const personaC=require('../app/controls/PersonaControl')
let personaControl=new personaC();

const rolC=require('../app/controls/RolControl')
let rolControl=new rolC();

const cuentaC=require('../app/controls/CuentaControl')
let cuentaControl=new cuentaC();

const noticiaC=require('../app/controls/NoticiaControl')
let noticiaControl=new noticiaC();

const comentarioC=require('../app/controls/ComentarioControl')
let comentarioControl=new comentarioC();

const auth=function middleware(req,res,next){
    const token =req.headers['news-token'];
    console.log(token);
    if(token===undefined){
      res.status(401);
      res.json({ msg: "Falta Token", code: 401 });
    }else{
      require('dotenv').config();
      const key=process.env.KEY_SEC;
      jwt.verify(token,key,async(err,decoded)=>{
        if(err){
          res.status(401);
          res.json({ msg: "ERROR",tag:'token no valido o expirado', code: 401 });
        }else{
          console.log(decoded.external);
          const models=require('../app/models');
          const cuenta=models.cuenta;
          const aux=await cuenta.findOne({
            where: {external_id:decoded.external}
         });
         if(aux===null){
          res.status(401);
          res.json({ msg: "ERROR",tag:'token no valido', code: 401 });
         }else{
          next();
        }
        }

      });
    }
    //console.log(req.url);
    //next();
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});




router.get('/admin/personas',personaControl.listar);
router.post('/admin/persona/save',personaControl.guardar);
router.get('/admin/persona/get/:external',personaControl.obtener);
router.post('/admin/persona/modificar/:external',personaControl.modificar);
router.post('/admin/persona/saveUser',personaControl.guardarUsuario);

router.get('/admin/roles',rolControl.listar);
router.post('/admin/rol/save',rolControl.guardar);

router.post('/admin/inicio_sesion',cuentaControl.inicio_sesion);
router.get('/admin/cuentas',cuentaControl.listar);


router.get('/admin/noticias',noticiaControl.listar);
router.get('/admin/noticia/get/:external',noticiaControl.obtener);
router.post('/admin/noticia/save',noticiaControl.guardar);
router.post('/admin/noticia/modify/:external',noticiaControl.modificar);
router.post('/admin/noticia/file/save/:external',noticiaControl.guardarFoto);
router.get('/admin/noticia/get/comentarios/:external',noticiaControl.obtenerComentarios);
router.post('/admin/noticia/get/comentariosbyUser/:external',noticiaControl.obtenerComentariosNoticiaPersona);

router.get('/admin/comentarios',comentarioControl.listar);
router.get('/admin/comentario/get/:external',comentarioControl.obtener);
router.post('/admin/comentario/save',comentarioControl.guardar);
router.post('/admin/comentario/modify/:external',comentarioControl.modificar);
router.post('/admin/comentario/banear/:external',comentarioControl.banearComentario);

module.exports = router;
