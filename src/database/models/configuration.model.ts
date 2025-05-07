export const model = (sequelize: any, DataTypes: any) => {
    sequelize.define(
      "Configuracion",
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        tipo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        numero_empresa: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        numero_secuencial: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        moneda: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      { updatedAt: false, timestamps: false }
    );
  };
  