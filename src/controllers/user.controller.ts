import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { Usuarios } from "../database/connection";

export class UserController {
  constructor() {}

  async fetchData(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body.user;

      const existUser = await Usuarios.findOne({
        where: { id: user.uuid },
      });

      if (!existUser)
        throw new Error(
          "Este usuario no existe porfavor intenta con otro correo"
        );

      res.status(200).json(existUser);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async auth(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;

      const existUser = await Usuarios.findOne({
        where: { correo: user.correo },
      });
      if (!existUser)
        throw new Error(
          "Este usuario no existe porfavor intenta con otro correo"
        );

      if (await comparePassword(user.password, existUser.get().password)) {
        const token = generateToken(existUser.get().id);
        res
          .status(201)
          .json({ usuario: existUser, token: token });
      } else {
        throw new Error("Contraseña incorrecta, intenta nuevamente");
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;

      const alreadyCorreo = await Usuarios.findOne({
        where: { correo: user.correo },
      });
      if (alreadyCorreo)
        throw new Error("Un usuario ya ha sido registrado bajo este correo");

      user.password = await hashPassword(user.password);

      await Usuarios.create(user);

      res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await Usuarios.findAll({
        attributes: { exclude: ["password"] },
      });
      if (!users) {
        res.status(404).json({ message: "No encontramos usuarios" });
        return;
      }
      res.status(200).json(users);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;
      const uuid = req.params.id;

      const userExist = await Usuarios.findOne({
        where: { id: uuid },
      });
      if (!userExist) throw new Error("Este usuario no existe");

      user.password = await hashPassword(user.password);

      await userExist.update(user);

      res.status(201).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.id;

      const userExist = await Usuarios.findOne({
        where: { id: uuid },
      });
      if (!userExist) throw new Error("Este usuario no existe");

      await userExist.destroy();

      res.status(201).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
