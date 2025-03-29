import config from '../utils/config';
import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";

const options: any = {
  dialect: "mariadb",
  host: config.DB_HOST,
  post: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASS,
  database: config.DB_NAME,
  logging: false,
  native: false,
  dialectOptions: {
    allowPublicKeyRetrieval: true,
  },
};

const sequelize = new Sequelize(options);

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
} = sequelize.models;

Clientes.hasMany(Liquidaciones);
Liquidaciones.belongsTo(Clientes);

export const conn = sequelize;
export const models = sequelize.models;
