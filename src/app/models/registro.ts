import { IPaciente } from "./paciente";

export interface Paciente extends Registro {
    id: string;
  }
  
export interface Registro {
    // paciente: IPaciente,
    paciente: string,
    descripcion: string,
    categoria: string,
    validado: boolean,
    estado: string,
    emisor: string,
    fecha: Date,
    hora: string,
}
