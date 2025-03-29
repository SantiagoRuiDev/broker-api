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
        direccion: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        contrato: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      { updatedAt: false, timestamps: false }
    );
}  