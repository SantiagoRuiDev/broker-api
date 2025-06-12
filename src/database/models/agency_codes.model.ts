export const model = (sequelize: any, DataTypes: any) => {
    sequelize.define(
      "Ramos",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        nombre_ramo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        codigo_ramo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        nombre_ramo_cia: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        codigo_ramo_cia: {
          type: DataTypes.STRING,
          allowNull: true,
        }
      },
      { updatedAt: false, timestamps: false }
    );
}  