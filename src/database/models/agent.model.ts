export const model = (sequelize: any, DataTypes: any) => {
  sequelize.define(
    "Subagentes",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      codigo: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM("Subagente", "Lider"),
        allowNull: false,
        default: "Subagente",
      },
      nombres: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apellidos: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      estatus: {
        type: DataTypes.ENUM("Activo", "Inactivo", "Suspendido"),
        allowNull: false,
        defaultValue: "Activo",
      },
      fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      genero: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ejecutivo_ciaros: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codigo_ejecutivo_ciaros: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nombre_de_comprobante: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_de_documento: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ruc_de_comprobante: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_de_regimen: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banda: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      numero_cuenta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codigo_de_beneficiario: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_de_cuenta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codigo_de_banco: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nombre_de_beneficiario: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      direccion_de_beneficiario: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ciudad_beneficiario: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telefono_beneficiario: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      localidad_de_cobro: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referencia: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referencia_adicional: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      documento: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ciudad: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tarifa_comision: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      iva: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      ret_iva: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      ret_renta: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      gastos_adm: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      liderId: {
        type: DataTypes.STRING,
        allowNull: true, // <---- Permite que esté vacío
      },
    },
    { updatedAt: false, timestamps: false }
  );
};
