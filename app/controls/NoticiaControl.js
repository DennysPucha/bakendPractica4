'use strict';
var models = require('../models')
var formidable = require('formidable')
var fs = require('fs');

var persona = models.persona;
var rol = models.rol;
var cuenta = models.cuenta;
var noticia = models.noticia;
class NoticiaControl {

    async listar(req, res) {
        var lista = await noticia.findAll({
            include: [
                { model: models.persona, as: 'persona', attributes: ['apellidos', 'nombres'] },
                { model: models.comentario, as: 'comentario', attributes: ['texto', 'fecha', 'estado', 'usuario', 'latitud', 'longitud', 'external_id'] }
            ],
            attributes: ['titulo', 'cuerpo', 'estado', 'tipo_archivo', 'fecha', 'tipo_noticia', 'external_id', 'archivo']
        });
        res.status(200);
        res.json({ msg: "OK", code: 200, datos: lista });
    }


    async obtener(req, res) {
        const external = req.params.external;
        var lista = await noticia.findOne({
            where: { external_id: external },
            include: [
                { model: models.persona, as: 'persona', attributes: ['apellidos', 'nombres'] },
            ],
            attributes: ['titulo', 'cuerpo', 'tipo_archivo', 'fecha', 'tipo_noticia', 'external_id', 'archivo']
        });
        if (lista == undefined || lista == null) {
            res.status(404);
            res.json({ msg: "No encontrado", code: 404, datos: {} });
        } else {
            res.status(200);
            res.json({ msg: "OK", code: 200, datos: lista });
        }
    }

    async  obtenerComentarios(req, res) {
        const external = req.params.external;
        var noticiaEncontrada = await noticia.findOne({ where: { external_id: external, estado:true } });
        if (!noticiaEncontrada) {
            res.status(404);
            res.json({ msg: "No encontrado", code: 404, datos: {} });
        } else {
            var listaComentarios = await models.comentario.findAll({
                where: { id_noticia: noticiaEncontrada.id, estado: true},
                order: [['fecha', 'DESC']], // Ordenar por fecha descendente
                limit: 10, // Limitar a los primeros 10 comentarios
                attributes: ['texto', 'fecha', 'estado', 'usuario', 'latitud', 'longitud', 'external_id']
            });
            res.status(200);
            res.json({ msg: "OK", code: 200, datos: listaComentarios });
        }
    }
    
    async  obtenerComentariosNoticiaPersona(req, res) {
        const external = req.params.external;
        if (req.body.hasOwnProperty('persona')) {
            var noticiaEncontrada = await noticia.findOne({ where: { external_id: external, estado:true } });
            var personaEncontrada = await persona.findOne({ where: { external_id: req.body.persona } });
            if (!personaEncontrada) {
                res.status(404);
                res.json({ msg: "Persona no encontrada", code: 404, datos: {} });
            } else if (!noticiaEncontrada) {
                res.status(404);
                res.json({ msg: "Noticia no encontrada", code: 404, datos: {} });
            } else {
                var comentarios = await models.comentario.findAll({
                    where: { id_noticia: noticiaEncontrada.id, usuario: req.body.persona , estado: true},
                    order: [['fecha', 'DESC']], // Ordenar por fecha descendente
                    limit: 10, // Limitar a los primeros 10 comentarios
                });
                res.status(200);
                res.json({ msg: "OK", code: 200, datos: comentarios });
            }
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }


    async guardar(req, res) {
        if (req.body.hasOwnProperty('titulo') &&
            req.body.hasOwnProperty('cuerpo') &&
            req.body.hasOwnProperty('fecha') &&
            req.body.hasOwnProperty('tipo_noticia') &&
            req.body.hasOwnProperty('persona')) {

            var uuid = require('uuid');

            var perA = await persona.findOne({
                where: { external_id: req.body.persona },
                include: [
                    { model: models.rol, as: 'rol', attributes: ['nombre'] },
                ],
            });

            if (perA == undefined || perA == null) {
                res.status(401);
                res.json({ msg: "ERROR", tag: "No se encuentra el editor", code: 401 });
            } else {
                var data = {
                    cuerpo: req.body.cuerpo,
                    external_id: uuid.v4(),
                    titulo: req.body.titulo,
                    fecha: req.body.fecha,
                    tipo_noticia: req.body.tipo_noticia,
                    archivo: 'noticia.png',
                    id_persona: perA.id
                };
                console.log(data);
                if (perA.rol.nombre == 'editor') {
                    var result = await noticia.create(data);
                    if (result === null) {
                        res.status(401);
                        res.json({ msg: "ERROR", tag: "No se puede crear", code: 401 });
                    } else {
                        perA.external_id = uuid.v4();
                        await perA.save();
                        res.status(200);
                        res.json({ msg: "OK", code: 200 });
                    }

                } else {
                    res.status(400);
                    res.json({ msg: "ERROR", tag: "la persona que esta ingresando a la noticia no es un editor" })
                }

            }

        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async modificar(req, res) {
        const external = req.params.external;
        if (req.body.hasOwnProperty('titulo') &&
            req.body.hasOwnProperty('cuerpo') &&
            req.body.hasOwnProperty('fecha') &&
            req.body.hasOwnProperty('tipo_noticia') &&
            req.body.hasOwnProperty('persona')) {

            var uuid = require('uuid');

            var perA = await persona.findOne({
                where: { external_id: req.body.persona },
                include: [
                    { model: models.rol, as: 'rol', attributes: ['nombre'] },
                ],
            });

            if (perA == undefined || perA == null) {
                res.status(401);
                res.json({ msg: "ERROR", tag: "No se encuentra el editor", code: 401 });
            }
            else {
                var data = {
                    cuerpo: req.body.cuerpo,
                    titulo: req.body.titulo,
                    fecha: req.body.fecha,
                    tipo_noticia: req.body.tipo_noticia,
                    id_persona: perA.id
                };
                console.log(data);
                if (perA.rol.nombre == 'editor') {
                    var result = await noticia.update(data, {
                        where: { external_id: external }
                    });
                    if (result === null) {
                        res.status(401);
                        res.json({ msg: "ERROR", tag: "No se puede modificar", code: 401 });
                    } else {
                        //perA.external_id = uuid.v4();
                        //await perA.save();
                        res.status(200);
                        res.json({ msg: "OK", code: 200 });
                    }

                }
                else {
                    res.status(400);
                    res.json({ msg: "ERROR", tag: "la persona que esta ingresando a la noticia no es un editor" })
                }

            }

        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async guardarFoto(req, res) {
        const external = req.params.external;
        var noticiaA = await noticia.findOne({
            where: { external_id: external },
        });
        console.log(noticiaA);

        var form = new formidable.IncomingForm(), files = [];
        form.on('file', function (field, file) {
            files.push(file);
        }).on('end', function () {
            console.log('OK');
        });
        form.parse(req, function (err, fields) {
            let listado = files;
            const maxSize = 2 * 1024 * 1024;
            const allowedFormats = ['jpg', 'png'];
            for (let index = 0; index < listado.length; index++) {
                var file = listado[index];

                var extension = file.originalFilename.split('.').pop().toLowerCase();

                if (file.size > maxSize || !allowedFormats.includes(extension)) {
                    res.status(400);
                    res.json({
                        msg: "ERROR",
                        tag: "Formato o tamaño de archivo no válido",
                        code: 400
                    });
                    return;
                } else {
                    const name = external + '.' + extension;
                    console.log(extension);
                    var data = {
                        archivo: name
                    };
                    fs.rename(file.filepath, 'public/multimedia/' + name, async function (err) {
                        if (err) {
                            res.status(200);
                            res.json({ msg: "ERROR", tag: " No se pudo guardar el archivo", code: 200 });
                        } else {
                            await noticiaA.update(data);
                        }
                    });
                }
            }
            res.status(200);
            res.json({ msg: "OK", code: 200 });
        });
    }

}
module.exports = NoticiaControl;