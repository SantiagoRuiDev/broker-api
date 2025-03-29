export const model = (sequelize: any, DataTypes: any) => {
  sequelize.define(
    "Clientes",
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
      telefono: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    { updatedAt: false, timestamps: false }
  );
};
