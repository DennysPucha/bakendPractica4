'use strict';
var models = require('../models')
var persona = models.persona;
var rol = models.rol;
var cuenta = models.cuenta;
class PersonaControl {

    async obtener(req, res) {
        const external = req.params.external;
        var lista = await persona.findOne({
            where: { external_id: external },
            include: [
                { model: models.cuenta, as: 'cuenta', attributes: ['correo', 'clave'] },
                { model: models.rol, as: 'rol', attributes: ['nombre'] }
            ],
            attributes: ['nombres', 'apellidos', 'celular', 'fecha_nac', 'direccion', 'id_rol', 'external_id']
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
        var lista = await persona.findAll({
            include: [
                { model: models.cuenta, as: 'cuenta', attributes: ['correo'] },
                { model: models.rol, as: 'rol', attributes: ['nombre'] }
            ],
            attributes: ['nombres', 'apellidos', 'celular', 'fecha_nac', 'direccion', 'id_rol', 'external_id']
        });
        res.status(200);
        res.json({ msg: "OK", code: 200, datos: lista });
    }

    async guardarUsuario(req, res) {
        if (
            req.body.hasOwnProperty('nombres') &&
            req.body.hasOwnProperty('apellidos') &&
            //req.body.hasOwnProperty('celular') &&
            //req.body.hasOwnProperty('fecha') &&
            //req.body.hasOwnProperty('direccion') &&
            req.body.hasOwnProperty('correo') &&
            req.body.hasOwnProperty('clave')
        ) {
            var uuid = require('uuid');
            var rolA = await rol.findOne({ where: { nombre: 'user' } });

            if (rolA === null) {
                try {
                    rolA = await rol.create({ nombre: 'user', external_id: uuid.v4() });
                } catch (error) {
                    res.status(500);
                    return res.json({ msg: "ERROR", tag: "Error al crear el rol", code: 500 });
                }
            }

            var cuentaA = await cuenta.findOne({ where: { correo: req.body.correo } });
            if (cuentaA != null) {
                res.status(400);
                return res.json({ msg: "ERROR", tag: "Correo ya existente", code: 400 });
            }
            var data = {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                celular: req.body.celular,
                fecha_nac: req.body.fecha,
                direccion: req.body.direccion,
                external_id: uuid.v4(),
                id_rol: rolA.id,
                cuenta: {
                    correo: req.body.correo,
                    clave: req.body.clave
                }
            }

            let transaction = await models.sequelize.transaction();

            try {
                var result = await persona.create(data, { include: [{ model: models.cuenta, as: "cuenta" }], transaction });
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
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async guardar(req, res) {
        if (req.body.hasOwnProperty('nombres') &&
            req.body.hasOwnProperty('apellidos') &&
            req.body.hasOwnProperty('celular') &&
            req.body.hasOwnProperty('fecha') &&
            req.body.hasOwnProperty('direccion') &&
            req.body.hasOwnProperty('correo') &&
            req.body.hasOwnProperty('clave') &&
            req.body.hasOwnProperty('rol')) {

            var uuid = require('uuid');
            var rolA = await rol.findOne({ where: { external_id: req.body.rol } });

            var cuentaA = await cuenta.findOne({ where: { correo: req.body.correo } });
            if (cuentaA != null) {
                res.status(400);
                return res.json({ msg: "ERROR", tag: "Correo ya existente", code: 400 });
            }

            if (rolA != undefined) {
                var data = {
                    nombres: req.body.nombres,
                    apellidos: req.body.apellidos,
                    celular: req.body.celular,
                    fecha_nac: req.body.fecha,
                    direccion: req.body.direccion,
                    external_id: uuid.v4(),
                    id_rol: rolA.id,
                    cuenta: {
                        correo: req.body.correo,
                        clave: req.body.clave
                    }
                }

                let transaction = await models.sequelize.transaction();

                try {
                    var result = await persona.create(data, { include: [{ model: models.cuenta, as: "cuenta" }], transaction });
                    //rolA.external_id=uuid.v4();
                    await rolA.save();
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
            } else {
                res.status(400);
                res.json({ msg: "ERROR", tag: "Dato no existente", code: 400 });
            }

        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async modificar(req, res) {
        if (
            req.body.hasOwnProperty('nombres') &&
            req.body.hasOwnProperty('apellidos') &&
            req.body.hasOwnProperty('celular') &&
            req.body.hasOwnProperty('fecha') &&
            req.body.hasOwnProperty('direccion') &&
            req.body.hasOwnProperty('correo') &&
            req.body.hasOwnProperty('clave')
        ) {
            const external = req.params.external;

            try {
                const personaA = await persona.findOne({ where: { external_id: external } });

                if (!personaA) {
                    res.status(404);
                    return res.json({ msg: "ERROR", tag: "Registro no encontrado", code: 404 });
                }

                // Crear objeto con los datos actualizados
                const data = {
                    nombres: req.body.nombres,
                    apellidos: req.body.apellidos,
                    celular: req.body.celular,
                    fecha_nac: req.body.fecha,
                    direccion: req.body.direccion,
                };

                // Actualizar los datos de la persona
                await personaA.update(data);

                // Buscar la cuenta asociada a la persona
                const cuentaA = await cuenta.findOne({ where: { id_persona: personaA.id } });

                if (!cuentaA) {
                    res.status(404);
                    return res.json({ msg: "ERROR", tag: "Cuenta no encontrada", code: 404 });
                }

                // Crear objeto con los datos de la cuenta actualizados
                const subData = {
                    correo: req.body.correo,
                    clave: req.body.clave,
                };

                // Actualizar los datos de la cuenta
                await cuentaA.update(subData);

                res.status(200);
                res.json({ msg: "OK", code: 200 });

            } catch (error) {
                if (transaction) await transaction.rollback();

                res.status(203);
                res.json({ msg: "ERROR", code: 203, error_msg: error });
            }
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }
}

module.exports = PersonaControl;