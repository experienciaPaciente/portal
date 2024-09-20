import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/models/paciente';


const PATH = 'pacientes';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private _firestore = inject(Firestore);
  private _collection = collection(this._firestore, PATH);

  getPacientes() {
    return collectionData(this._collection, { idField: 'id' }) as Observable<
      IPaciente[]
    >;
  }

  async getPaciente(id: string) {
    try {
      const snapshot = await getDoc(this.document(id));
      return snapshot.data() as IPaciente;
    } catch (error) {
      return undefined;
    }
  }

  async searchPacienteByQuery(name: string) {
    const q = query(
      this._collection,
      where('fullName', '>=', name),
      where('fullName', '<=', name + '\uf8ff'),
    );
    const querySnapshot = await getDocs(q);
    let pacientes: IPaciente[] = [];
    querySnapshot.forEach((doc) => {
      pacientes = [...pacientes, { id: doc.id, ...doc.data() } as unknown as IPaciente];
    });
    return pacientes;
  }

  createPaciente(paciente: IPaciente) {
    return addDoc(this._collection, paciente);
  }

  updatePaciente(id: string, paciente: IPaciente) {
    return updateDoc(this.document(id), { ...paciente });
  }

  deletePaciente(id: string) {
    return deleteDoc(this.document(id));
  }

  private document(id: string) {
    return doc(this._firestore, `${PATH}/${id}`);
  }
}
