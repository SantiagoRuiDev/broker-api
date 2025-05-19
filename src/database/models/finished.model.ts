export const model = (sequelize: any, DataTypes: any) => {
  sequelize.define(
    "Finalizadas",
    {
      numero_liquidacion: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      kanban: {
        type: DataTypes.ENUM("Emitida", "Enviada", "Lista", "Pagada", "Archivada"),
        allowNull: false,
      },
      fecha_liquidacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha_pago: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_liquidado: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      prestamo: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      iva: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ret_iva: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ret_renta: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      gastos_adm: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      tarifa_comision: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    { updatedAt: false, timestamps: false }
  );
};
