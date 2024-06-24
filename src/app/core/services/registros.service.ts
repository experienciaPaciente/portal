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

import { Registro, Paciente } from 'src/app/models/registro';

const PATH = 'registros';

@Injectable({
  providedIn: 'root',
})
export class RegistrosService {
  private _firestore = inject(Firestore);

  private _collection = collection(this._firestore, PATH);

  getRegistros() {
    return collectionData(this._collection, { idField: 'id' }) as Observable<
      Registro[]
    >;
  }

  async getRegistro(id: string) {
    try {
      const snapshot = await getDoc(this.document(id));
      return snapshot.data() as Registro;
    } catch (error) {
      //catch error
      return undefined;
    }
  }

  async searchRegistroByQuery(name: string) {
    const q = query(
      this._collection,
      where('fullName', '>=', name),
      where('fullName', '<=', name + '\uf8ff'),
    );
    const querySnapshot = await getDocs(q);
    let registros: Registro[] = [];
    querySnapshot.forEach((doc) => {
      registros = [...registros, { id: doc.id, ...doc.data() } as unknown as Registro];
    });
    return registros;
  }

  createRegistro(registro: Registro) {
    return addDoc(this._collection, registro);
  }

  updateRegistro(id: string, registro: Registro) {
    return updateDoc(this.document(id), { ...registro });
  }

  deleteRegistro(id: string) {
    return deleteDoc(this.document(id));
  }

  getRegistrosByUserId(userId: string): Observable<Registro[]> {
    const q = query(this._collection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Registro[]>;
  }

  private document(id: string) {
    return doc(this._firestore, `${PATH}/${id}`);
  }
}
