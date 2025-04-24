import express from "express";
import cors from "cors";
import config from "./utils/config";
import agencyRoutes from "./routes/agency.routes";
import userRoutes from "./routes/user.routes";
import clientRoutes from "./routes/client.routes";
import agentRoutes from "./routes/agent.routes";
import settlementRoutes from "./routes/settlement.routes";
import { conn, Usuarios } from "./database/connection";
import { hashPassword } from "./utils/password";

const app = express();


app.use(
  "*",
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-multiuser-token"],
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/settlements", settlementRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/clients", clientRoutes);

app.use("/public/media", express.static("public/media"));

conn.sync({ force: true }).then(async () => {
  // Creamos un usuario

  const adminExist = await Usuarios.findOne({ where: { correo: "admin@mipanel.online" } });
  if (!adminExist) {
    Usuarios.create({
      nombre: "Maximiliano García",
      rol: "Admin",
      correo: "admin@mipanel.online",
      password: await hashPassword("123qwe"),
    })
      .then(() => console.log("Usuario administrador ha sido creado por defecto"))
      .catch(() => console.log("Error al crear el usuario"));
  }
});


app.listen(config.PORT, () => {
  console.log(`SERVER RUNNING ON PORT: ${config.PORT}`);
});
