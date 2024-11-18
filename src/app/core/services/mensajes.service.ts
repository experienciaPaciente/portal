import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<string[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  addNotification(message: string) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, message]);

    setTimeout(() => {
        this.removeNotification(0);
      }, 3000);
  }

  removeNotification(index: number) {
    const currentNotifications = this.notificationsSubject.value;
    currentNotifications.splice(index, 1);
    this.notificationsSubject.next([...currentNotifications]);
  }

  clearNotifications() {
    this.notificationsSubject.next([]);
  }
}
