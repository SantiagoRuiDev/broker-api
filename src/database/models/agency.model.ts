export const model = (sequelize: any, DataTypes: any) => {
    sequelize.define(
      "Aseguradoras",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        nombre: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        correo: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        ciudad: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        direccion: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        contrato: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        correo_encargado_sucursal: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      { updatedAt: false, timestamps: false }
    );
}  