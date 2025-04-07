export const model = (sequelize: any, DataTypes: any) => {
    sequelize.define(
      "Sucursales",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        ciudad: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        encargado: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        correo: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false,
        },
      },
      { updatedAt: false, timestamps: false }
    );
}  