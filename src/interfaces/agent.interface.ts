export interface IAgent {
  id?: string;
  codigo: string;
  rol: SubAgenteRol;
  nombres: string;
  apellidos: string;
  correo: string;
  estatus: string;
  fecha_nacimiento?: string;
  genero?: string;
  ejecutivo_ciaros?: string;
  nombre_de_comprobante?: string;
  tipo_de_documento?: string;
  ruc_de_comprobante?: string;
  tipo_de_regimen?: string;
  banda?: string;
  numero_cuenta?: string;
  codigo_de_beneficiario?: string;
  tipo_de_cuenta?: string;
  numero_de_cedula?: string;
  codigo_de_banco?: string;
  telefono?: string;
  nombre_de_beneficiario?: string;
  direccion_de_beneficiario?: string;
  ciudad_beneficiario?: string;
  telefono_beneficiario?: string;
  localidad_de_cobro?: string;
  referencia?: string;
  referencia_adicional?: string;
  cedula?: string;
  ciudad?: string;
  tarifa_comision?: number;
  liderId?: string;
}

enum SubAgenteRol {
  SUBAGENTE = "Subagente",
  LIDER = "Lider",
}
