import express from "express";
import cors from "cors";
import config from "./utils/config";

import agencyRoutes from "./routes/agency.routes";
import userRoutes from "./routes/user.routes";
import clientRoutes from "./routes/client.routes";
import agentRoutes from "./routes/agent.routes";
import settlementRoutes from "./routes/settlement.routes";
import configurationRoutes from "./routes/configuration.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { Configuracion, conn, Usuarios } from "./database/connection";
import { hashPassword } from "./utils/password";

const app = express();

app.use(
  "*",
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-multiuser-token",
    ],
  })
);

app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: true }));

app.use("/api/settlements", settlementRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/configuration", configurationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/public/media", express.static("public/media"));

conn.sync().then(async () => {
  // Creamos un usuario

  const adminExist = await Usuarios.findOne({
    where: { correo: "admin@ciaros.com" },
  });
  if (!adminExist) {
    Usuarios.create({
      nombre: "Administrador",
      rol: "Admin",
      correo: "admin@ciaros.com",
      password: await hashPassword("123qwe"),
    })
      .then(() =>
        console.log("Usuario administrador ha sido creado por defecto")
      )
      .catch(() => console.log("Error al crear el usuario"));
  }
  const configurationExist = await Usuarios.findOne({
    where: { id: "CONFIGURACION" },
  });
  if (!configurationExist) {
    Configuracion.create({
      id: "CONFIGURACION",
      moneda: "USD",
      tipo: "PA",
      numero_empresa: "2006002291",
      forma_de_pago: "CTA",
      numero_secuencial: "12345679",
      codigo_broker: "1234"
    })
      .then(() => console.log("Configuración creada por defecto"))
      .catch(() => console.log("Error al crear la configuración"));
  }
});

app.listen(Number(config.PORT), '0.0.0.0', () => {
  console.log(`SERVER RUNNING ON PORT: ${config.PORT}`);
});
