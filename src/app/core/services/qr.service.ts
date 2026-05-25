import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private qrDataSubject = new BehaviorSubject<string | null>(null);
  qrData$ = this.qrDataSubject.asObservable();

  setQRData(data: string | null): void {
    this.qrDataSubject.next(data);
  }

  clearQRData(): void {
    this.qrDataSubject.next(null);
  }
}
