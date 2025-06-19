import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AbsenceDeclaration} from '../models/AbsenceDeclarationModel';
import {Notification} from '../models/NotificationModel';

@Injectable({
  providedIn: 'root'
})
export class MaladieService {
  private apiUrl = 'http://localhost:8080/api/maladie';

  constructor(private http: HttpClient) {}

  saveNotification(notification: Notification): Observable<string> {
    return this.http.post(`${this.apiUrl}/notify`, notification, { responseType: 'text' });
  }

  saveAbsenceDeclaration(absenceDeclaration: AbsenceDeclaration): Observable<string> {
    return this.http.post(`${this.apiUrl}/declare`, absenceDeclaration, { responseType: 'text' });
  }

  saveJustification(formData: FormData): Observable<string> {
    return this.http.post(`${this.apiUrl}/justify`, formData, { responseType: 'text' });
  }
}
