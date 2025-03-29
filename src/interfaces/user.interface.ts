export interface IUser {
    id?: string;
    nombre: string;
    rol: "Admin" | "Asistente";
    correo: string;
    password: string;
  };  