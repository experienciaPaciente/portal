import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private qrDataSubject = new BehaviorSubject<string | null>(null);
  qrData$ = this.qrDataSubject.asObservable();

  setQRData(data: string): void {
    this.qrDataSubject.next(data);
  }
}
