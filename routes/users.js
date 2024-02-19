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




router.get('/admin/personas',auth,personaControl.listar);
router.post('/admin/persona/save',auth,personaControl.guardar);
router.get('/admin/persona/get/:external',auth,personaControl.obtener);
router.post('/admin/persona/modificar/:external',auth,personaControl.modificar);
router.post('/admin/persona/saveUser',auth,personaControl.guardarUsuario);

router.get('/admin/roles',auth,rolControl.listar);
router.post('/admin/rol/save',auth,rolControl.guardar);

router.post('/admin/inicio_sesion',auth,cuentaControl.inicio_sesion);
router.get('/admin/cuentas',auth,cuentaControl.listar);


router.get('/admin/noticias',auth,noticiaControl.listar);
router.get('/admin/noticia/get/:external',auth,noticiaControl.obtener);
router.post('/admin/noticia/save',auth,noticiaControl.guardar);
router.post('/admin/noticia/modify/:external',auth,noticiaControl.modificar);
router.post('/admin/noticia/file/save/:external',auth,noticiaControl.guardarFoto);
router.get('/admin/noticia/get/comentarios/:external',auth,noticiaControl.obtenerComentarios);
router.post('/admin/noticia/get/comentariosbyUser/:external',auth,noticiaControl.obtenerComentariosNoticiaPersona);

router.get('/admin/comentarios',auth,comentarioControl.listar);
router.get('/admin/comentario/get/:external',auth,comentarioControl.obtener);
router.post('/admin/comentario/save',auth,comentarioControl.guardar);
router.post('/admin/comentario/modify/:external',auth,comentarioControl.modificar);
router.post('/admin/comentario/banear/:external',auth,comentarioControl.banearComentario);

module.exports = router;
