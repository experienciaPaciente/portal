import { IPaciente } from "./paciente";

export interface Paciente extends Registro {
    id: string;
  }
  
export interface Registro {
    // paciente: IPaciente,
    id: string,
    userId?: string;
    paciente: string,
    titulo: string,
    descripcion: string,
    categoria: string,
    estado: string,
    validado: boolean,
    lugar?: string,
    validador?: string,
    fecha: Date,
    hora: string,
    adjuntos: string[],
}
