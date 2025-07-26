export const model = (sequelize: any, DataTypes: any) => {
  sequelize.define(
    "Liquidaciones",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tipo: {
        type: DataTypes.ENUM(
          "Pre Liquidacion",
          "Negocio pendiente por liberar",
          "Negocio pendiente por facturar",
          "Consolidado",
          "Archivado"
        ),
        defaultValue: "Pre Liquidacion",
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM(
          "Emitida",
          "Lista",
          "Por Facturar",
          "Por Liberar",
          "Archivada"
        ),
        defaultValue: "Emitida",
        allowNull: false,
      },
      factura_ciaros: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      factura: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      documento: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      orden: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha_vence: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      d_inicial: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      poliza: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      anexo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      endoso: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codigo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cliente: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      f_contab: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      valor_prima: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      comision: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      ori: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      F: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      L: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      P: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha_importacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      Notas: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha_pagada: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_cobrada: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_factura_ciaros: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_liquidada: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    { updatedAt: false, timestamps: false }
  );
};
