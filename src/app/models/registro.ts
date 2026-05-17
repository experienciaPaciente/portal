import { IA } from "./ai";
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
    ai?: IA;
    aiProcesado?: boolean;
    aiEstado?: 'pending' | 'processing' | 'completed' | 'error';
    aiVersion?: string;
}
