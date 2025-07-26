import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { Usuarios } from "../database/connection";
import { CustomRequest } from "../interfaces/custom_request.interface";

export class UserController {
  constructor() {}

  async fetchData(req: CustomRequest, res: Response): Promise<void> {
    try {
      const user = req.user.uuid;

      const existUser = await Usuarios.findOne({
        where: { id: user },
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
        res.status(201).json({ usuario: existUser, token: token });
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
      const limit = Number(req.query.limit);
      const page = Number(req.query.page);

      const count = await Usuarios.count();
      const users = await Usuarios.findAll({
        limit: limit ? limit : undefined,
        offset: page ? (page - 1) * limit : undefined,
        attributes: { exclude: ["password"] },
      });
      if (!users) {
        res.status(404).json({ message: "No encontramos usuarios" });
        return;
      }
      res.status(200).json({users, count});
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

      if (user == null || user == undefined) {
        throw new Error("Envia un cuerpo valido");
      }

      if (
        Object.values(user).filter((value) => value == "" || value == null)
          .length > 0
      ) {
        throw new Error("No puedes enviar campos vacios");
      }

      const userExist = await Usuarios.findOne({
        where: { id: uuid },
      });
      if (!userExist) throw new Error("Este usuario no existe");

      await userExist.update(user);

      res.status(201).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async changePassword(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { old_password, new_password, repeat_password } = req.body;
      const uuid = req.user ? req.user.uuid : "";

      const userExist = await Usuarios.findOne({
        where: { id: uuid },
      });
      if (!userExist) throw new Error("Este usuario no existe");

      if (await comparePassword(old_password, userExist.dataValues.password)) {
        if (new_password == repeat_password) {
          userExist.update({ password: await hashPassword(new_password) });
        } else {
          throw new Error("Las contraseñas nuevas no son equivalentes");
        }
      } else {
        throw new Error("La contraseña actual no coincide");
      }

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
