import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Insight {
  resumenGeneral: string;
  recomendaciones: string[];
  alertas: string[];
  condicionesRecurrentes: string[];
  sintomasRecurrentes: string[];
  emocionesPrevalentes: string[];
  sentimientoGeneral: 'positivo' | 'neutral' | 'negativo';
  nivelFrustracion: 'bajo' | 'medio' | 'alto';
  nivelAnsiedad: 'bajo' | 'medio' | 'alto';
  seguimientosPendientes: string[];
  brechasPreventivas: string[];
  problemasAdministrativos: string[];
  generatedAt: Timestamp;
  totalRegistrosAnalizados: number;
}

const INSIGHTS_COLLECTION = 'insights';

@Injectable({
  providedIn: 'root',
})
export class InsightsService {
  private _firestore = inject(Firestore);

  getInsight(userId: string): Observable<Insight | null> {
    const docRef = doc(this._firestore, INSIGHTS_COLLECTION, userId);
    return docData(docRef) as Observable<Insight | null>;
  }
}
