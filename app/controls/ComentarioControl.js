"use strict";
var models = require("../models");
var persona = models.persona;
var rol = models.rol;
var cuenta = models.cuenta;
var comentario = models.comentario;
var noticia = models.noticia;
class ComentarioControl {
    async obtener(req, res) {
        const external = req.params.external;
        var lista = await comentario.findOne({
            where: { external_id: external, estado: true},
            include: [
                {
                    model: models.noticia,
                    as: "noticia",
                    attributes: ["titulo", "cuerpo", "fecha", "estado"],
                },
            ],
            attributes: [
                "texto",
                "fecha",
                "estado",
                "usuario",
                "latitud",
                "longitud",
                "external_id",
                "id_noticia"
            ],
        });
        if (lista == undefined || lista == null) {
            res.status(404);
            res.json({ msg: "No encontrado", code: 404, datos: {} });
        } else {
            res.status(200);
            res.json({ msg: "OK", code: 200, datos: lista });
        }
    }

    async listar(req, res) {
        var lista = await comentario.findAll({
            where: { estado: true },
            include: [
                {
                    model: models.noticia,
                    as: "noticia",
                    attributes: ["titulo", "cuerpo", "fecha", "estado"],
                },
            ],
            attributes: [
                "texto",
                "fecha",
                "estado",
                "usuario",
                "latitud",
                "longitud",
                "external_id",
                "id_noticia",
            ],
        });
        res.status(200);
        res.json({ msg: "OK", code: 200, datos: lista });
    }

    async guardar(req, res) {
        if (
            req.body.hasOwnProperty("texto") &&
            req.body.hasOwnProperty("fecha") &&
            req.body.hasOwnProperty("usuario") &&
            req.body.hasOwnProperty("latitud") &&
            req.body.hasOwnProperty("longitud") &&
            req.body.hasOwnProperty("noticia")
        ) {
            var uuid = require("uuid");
            var noticiaA = await models.noticia.findOne({
                where: { external_id: req.body.noticia },
            });

            if (noticiaA == undefined) {
                res.status(400);
                res.json({ msg: "ERROR", tag: "Noticia no existente", code: 400 });
            }
            var personaA = await models.persona.findOne({
                where: { external_id: req.body.usuario },
            });

            if (noticiaA == undefined) {
                res.status(400);
                res.json({ msg: "ERROR", tag: "Noticia no existente", code: 400 });
            } else if (personaA == undefined) {
                res.status(400);
                res.json({ msg: "ERROR", tag: "Persona no existente", code: 400 });
            } else {
                var rolA = await models.rol.findOne({ where: { id: personaA.id_rol } });
                if (rolA.nombre !== "user") {
                    res.status(400);
                    res.json({
                        msg: "ERROR",
                        tag: "La persona no tiene el rol 'user'",
                        code: 400,
                    });
                } else {
                    var data = {
                        texto: req.body.texto,
                        fecha: req.body.fecha,
                        usuario: req.body.usuario,
                        latitud: req.body.latitud,
                        longitud: req.body.longitud,
                        external_id: uuid.v4(),
                        id_noticia: noticiaA.id,
                    };
                    let transaction = await models.sequelize.transaction();
                    try {
                        var result = await comentario.create(data, { transaction });
                        await transaction.commit();
                        if (result === null) {
                            res.status(401);
                            res.json({ msg: "ERROR", tag: "No se puede crear", code: 401 });
                        } else {
                            res.status(200);
                            res.json({ msg: "OK", code: 200 });
                        }
                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        res.status(203);
                        res.json({ msg: "ERROR", code: 203, error_msg: error });
                    }
                }
            }
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async modificar(req, res) {
        const external = req.params.external;
        if (
            req.body.hasOwnProperty("texto") &&
            req.body.hasOwnProperty("fecha") &&
            // req.body.hasOwnProperty("estado") &&
            req.body.hasOwnProperty("usuario") &&
            req.body.hasOwnProperty("latitud") &&
            req.body.hasOwnProperty("longitud")
        ) {

            try {
                const comentarioA = await comentario.findOne({
                    where: { external_id: external },
                });
                if (!comentarioA) {
                    res.status(404);
                    return res.json({
                        msg: "ERROR",
                        tag: "Comentario no encontrado",
                        code: 404,
                    });
                }

                var personaA = await models.persona.findOne({
                    where: { external_id: req.body.usuario },
                });

                var rolA = await models.rol.findOne({
                    where: { id: personaA.id_rol },
                });
                if (rolA.nombre !== "user") {
                    res.status(400);
                    res.json({
                        msg: "ERROR",
                        tag: "La persona no tiene el rol 'user'",
                        code: 400,
                    });
                } else {
                    const data = {
                        texto: req.body.texto,
                        fecha: req.body.fecha,
                        usuario: req.body.usuario,
                        latitud: req.body.latitud,
                        longitud: req.body.longitud,
                    };
                    const transaction = await models.sequelize.transaction();
                    try {
                        await comentarioA.update(data, { transaction });
                        await transaction.commit();
                        res.status(200);
                        res.json({ msg: "OK", code: 200 });
                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        res.status(203);
                        res.json({ msg: "ERROR", code: 203, error_msg: error });
                    }
                }

            } catch (error) {
                res.status(500);
                res.json({ msg: "ERROR", code: 500, error_msg: error });
            }
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async  banearComentario(req, res) {
        const external = req.params.external;
        try {
            const comentarioA = await comentario.findOne({
                where: { external_id: external },
            });
    
            if (!comentarioA) {
                res.status(404);
                return res.json({
                    msg: "ERROR",
                    tag: "Comentario no encontrado",
                    code: 404,
                });
            }
             console.log(comentarioA);
    
            const personaA = await models.persona.findOne({
                where: { external_id: comentarioA.usuario },
            });
    
            if (!personaA) {
                res.status(404);
                return res.json({
                    msg: "ERROR",
                    tag: "Persona no encontrada",
                    code: 404,
                });
            }
    
             console.log(personaA);
            const cuentaA = await models.cuenta.findOne({
                where: { id_persona: personaA.id},
            });
            console.log(cuentaA);
            if (!cuentaA) {
                res.status(404);
                return res.json({
                    msg: "ERROR",
                    tag: "Cuenta no encontrada",
                    code: 404,
                });
            }
    
    
            const transaction = await models.sequelize.transaction();
            try {
                await comentarioA.update({estado: false}, { transaction });
                await cuentaA.update({ estado: false }, { transaction });
                await transaction.commit();
                res.status(200);
                res.json({ msg: "OK", code: 200 });
            } catch (error) {
                if (transaction) await transaction.rollback();
                res.status(203);
                res.json({ msg: "ERROR", code: 203, error_msg: error });
            }
        } catch (error) {
            res.status(500);
            res.json({ msg: "ERROR", code: 500, error_msg: error });
        }
    }

}
module.exports = ComentarioControl;
