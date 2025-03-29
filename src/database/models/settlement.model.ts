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
          "Negocio Pendiente",
          "Negocio Liberado",
          "Consolidado"
        ),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM("Emitido", "Enviado", "Listo", "Pagado"),
        allowNull: false,
      },
      empresa: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ciudad: {
        type: DataTypes.STRING,
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
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      poliza: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      anexo: {
        type: DataTypes.STRING,
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
      S: {
        type: DataTypes.STRING,
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
      ori: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sAge: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha_facturacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      facturado: {
        type: DataTypes.ENUM("Si", "No"),
        allowNull: true,
      },
      cobrado: {
        type: DataTypes.ENUM("Si", "No"),
        allowNull: true,
      },
      fecha_cobrado: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      pagado: {
        type: DataTypes.ENUM("Si", "No"),
        allowNull: true,
      },
      fecha_liquidacion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      por_enviar: {
        type: DataTypes.ENUM("Si", "No"),
        allowNull: true,
      },
      subagenteId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Subagentes",
          key: "id",
        },
      },
      aseguradoraId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Aseguradoras",
          key: "id",
        },
      },
    },
    { updatedAt: false, timestamps: false }
  );
};
