import config from "../utils/config";
import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
  config.DB_NAME || "",
  config.DB_USER || "",
  config.DB_PASS,
  {
    host: config.DB_HOST,
    port: config.DB_PORT, // Nota: Debe ser "port" y no "post"
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,         // máximo de conexiones simultáneas
      min: 0,
      acquire: 30000, // tiempo máximo en ms que Sequelize esperará para obtener una conexión
      idle: 10000     // tiempo en ms que una conexión puede estar inactiva antes de ser liberada
    }
  }
);

const basename = path.basename(__filename);

// Leer todos los archivos de la carpeta models y agregarlos al arreglo modelDefiners
const modelDefiners: Array<(sequelize: any, DataTypes: any) => void> = [];
fs.readdirSync(__dirname + "/models")
  /*   .map((file) => {
    console.log("File:", file);
    return file;
  }) */
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      (file.slice(-3) === ".ts" || file.slice(-3) === ".js")
  )
  .forEach((file) => {
    const modelDefiner = require(path.join(__dirname + "/models", file)).model;
    modelDefiners.push(modelDefiner);
  });

// Agregar todos los modelos definidos al objeto sequelize.models
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize, DataTypes);
}

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
export const {
  Usuarios,
  Brokers,
  Aseguradoras,
  Clientes,
  Liquidaciones,
  Polizas,
  Subagentes,
  Sucursales,
  Configuracion
} = sequelize.models;

Subagentes.hasMany(Liquidaciones);
Clientes.hasMany(Liquidaciones);
Aseguradoras.hasMany(Sucursales);
Sucursales.hasMany(Liquidaciones);
Aseguradoras.hasMany(Liquidaciones);
Sucursales.belongsTo(Aseguradoras);
Liquidaciones.belongsTo(Subagentes);
Liquidaciones.belongsTo(Clientes);
Liquidaciones.belongsTo(Sucursales);
Liquidaciones.belongsTo(Aseguradoras);

export const conn = sequelize;
export const models = sequelize.models;
