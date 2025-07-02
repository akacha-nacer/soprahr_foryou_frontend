import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbsenceDeclaration } from '../models/AbsenceDeclarationModel';
import { Notification } from '../models/NotificationModel';
import {NotificationDTO} from '../models/NotificationDTOModel';

@Injectable({
  providedIn: 'root'
})
export class MaladieService {
  private apiUrl = 'http://localhost:8080/api/maladie';

  constructor(private http: HttpClient) {}

  saveNotification(notification: Notification, employeeId: number): Observable<Notification> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.post<Notification>(`${this.apiUrl}/notify`, notification, { params });
  }

  saveAbsenceDeclaration(absenceDeclaration: AbsenceDeclaration, employeeId: number): Observable<AbsenceDeclaration> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.post<AbsenceDeclaration>(`${this.apiUrl}/declare`, absenceDeclaration, { params });
  }

  saveJustification(formData: FormData, absenceDeclarationId: number): Observable<string> {
    formData.append('absenceDeclarationId', absenceDeclarationId.toString());
    return this.http.post(`${this.apiUrl}/justify`, formData, { responseType: 'text' });
  }

  getActiveNotification(employeeId: number): Observable<Notification | null> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.get<Notification | null>(`${this.apiUrl}/notifications/active`, { params });
  }

  getActiveAbsenceDeclaration(employeeId: number): Observable<AbsenceDeclaration | null> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.get<AbsenceDeclaration | null>(`${this.apiUrl}/declarations/active`, { params });
  }

  closeSickLeave(employeeId: number): Observable<string> {
    const params = new HttpParams().set('employeeId', employeeId.toString());
    return this.http.post(`${this.apiUrl}/close`, null, { params, responseType: 'text' });
  }

  getNotificationsWithDeclarations(managerId: number| null): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/manager/${managerId}/getnotif`);
  }

  validateNotification(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notifications/${notificationId}/validate`, { isValidated: true });
  }
}
