"use strict";

module.exports = (sequelize, DataTypes) => {
    const comentario = sequelize.define('comentario', {
        texto: { type: DataTypes.STRING(250), defaultValue: "NONE" },
        fecha: { type: DataTypes.DATEONLY },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        usuario: { type: DataTypes.STRING(100), defaultValue: "NONE" },
        longitud: { type: DataTypes.FLOAT, defaultValue: 0.0 },
        latitud: { type: DataTypes.FLOAT, defaultValue: 0.0 },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, { freezeTableName: true });

    comentario.associate = function (models) {
        comentario.belongsTo(models.noticia, {
            foreignKey: 'id_noticia', as: 'noticia',
        });
    };

    return comentario;
};
