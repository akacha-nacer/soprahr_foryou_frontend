import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {NatureHeure} from '../models/journee/NatureHeureModel';
import {catchError, Observable, throwError} from 'rxjs';
import {map} from 'd3';
import {NatureHeureModificationRequest} from '../models/journee/NatureHeureModificationRequestModel';
import {Anomalies} from '../models/journee/AnomaliesModel';
import {Pointage} from '../models/journee/PointageModel';
import {NatureHeureRequest} from '../models/journee/NatureHeureRequestModel';
import {NatureHeureDeletionRequest} from '../models/journee/NatureHeureDeletionRequestModel';
import {NotificationDTO} from '../models/NotificationDTOModel';
import {JourneeNotificationDTO} from '../models/journee/JourneeNotificationDTO';
import {NatureHeureDeleteDTO} from '../models/journee/NatureHeureDeleteDTO';

@Injectable({
  providedIn: 'root'
})
export class JourneeService {

  private apiUrl = 'http://localhost:8080/api/journee';
  constructor(private http: HttpClient) { }

  savePointages(pointages: Pointage[], userId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/save_pointages?userId=${userId}`, pointages);
  }

  saveAnomalie(anomalies: Anomalies, userId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/save_anomalie?userId=${userId}`, anomalies);
  }

  saveNatureHeure(natureHeure: NatureHeure, userId: number): Observable<NatureHeureRequest> {
    return this.http.post<NatureHeureRequest>(`${this.apiUrl}/save_nature_heure?userId=${userId}`, natureHeure);
  }

  getPendingRequests(managerId: number | null): Observable<NatureHeureRequest[]> {
    if (managerId === null) {
      throw new Error('managerId is null');
    }
    const params = new HttpParams().set('managerId', managerId.toString());
    return this.http.get<NatureHeureRequest[]>(`${this.apiUrl}/pending_requests`, { params });
  }

  getPendingModificationRequests(managerId: number | null): Observable<JourneeNotificationDTO[]> {
    if (managerId === null) {
      throw new Error('managerId is null');
    }
    const params = new HttpParams().set('managerId', managerId.toString());
    return this.http.get<JourneeNotificationDTO[]>(`${this.apiUrl}/pending_modification_requests`, { params });
  }

  getPendingDeletionRequests(managerId: number | null): Observable<NatureHeureDeleteDTO[]> {
    if (managerId === null) {
      throw new Error('managerId is null');
    }
    const params = new HttpParams().set('managerId', managerId.toString());
    return this.http.get<NatureHeureDeleteDTO[]>(`${this.apiUrl}/pending_deletion_requests`, { params });
  }

  approveNatureHeureRequest(requestId: number, managerId: number | null ): Observable<NatureHeure> {
    return this.http.post<NatureHeure>(`${this.apiUrl}/approve_nature_heure_request/${requestId}?managerId=${managerId}`, {});
  }

  rejectNatureHeureRequest(requestId: number, managerId: number | null ): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reject_nature_heure_request/${requestId}?managerId=${managerId}`, {});
  }

  approveModificationRequest(requestId: number, managerId: number | null): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/approve_modification_request/${requestId}?managerId=${managerId}`, {});
  }

  rejectModificationRequest(requestId: number, managerId: number | null): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/reject_modification_request/${requestId}?managerId=${managerId}`, {});
  }

  approveDeletionRequest(requestId: number, managerId: number | null): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/approve_deletion_request/${requestId}?managerId=${managerId}`, {});
  }

  rejectDeletionRequest(requestId: number, managerId: number | null): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/reject_deletion_request/${requestId}?managerId=${managerId}`, {});
  }

  getNatureHeures(userId: number): Observable<NatureHeure[]> {
    return this.http.get<NatureHeure[]>(`${this.apiUrl}/retrieve-all-NatureHrs?userId=${userId}`);
  }

  getAllPointages(userId: number): Observable<Pointage[]> {
    return this.http.get<Pointage[]>(`${this.apiUrl}/retrieve-all-Pointages?userId=${userId}`);
  }


  updateNatureHeure(id: number, natureHeure: NatureHeure, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_nature_heure/${id}?userId=${userId}`, natureHeure);
  }

  requestNatureHeureUpdate(request: NatureHeureModificationRequest, userId: number, natureHeureId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/request_update_nature_heure?userId=${userId}&natureHeureId=${natureHeureId}`, request);
  }

  deleteNatureHeure(id: number, userId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete_nature_heure/${id}?userId=${userId}`);
  }

  requestNatureHeureDeletion(natureHeureId: number, userId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/request_delete_nature_heure/${natureHeureId}?userId=${userId}`, {});
  }

  getNatureHeureNotifications(managerId: number): Observable<NotificationDTO[]> {
    if (managerId === null) throw new Error('managerId is null');
    const params = new HttpParams().set('managerId', managerId.toString());
    return this.http.get<NotificationDTO[]>(`${this.apiUrl}/nature_heure_notifications`, { params }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nServer Message: ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getNatureHeureById(natureHeureId: number): Observable<NatureHeure> {
    return this.http.get<NatureHeure>(`${this.apiUrl}/nature_heure/${natureHeureId}`).pipe(catchError(this.handleError));
  }

  getUserAnomaliesForToday(userId: number): Observable<Anomalies[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Anomalies[]>(`${this.apiUrl}/anomalies/today`, { params });
  }

  getAllUserAnomalies(userId: number): Observable<Anomalies[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Anomalies[]>(`${this.apiUrl}/retrieve-all-Anomalies`, { params });
  }

  generateAnomaliesForUser(userId: number, date: string): Observable<Anomalies[]> {
    const params = new HttpParams().set('date', date);
    return this.http.post<Anomalies[]>(`${this.apiUrl}/anomalies/generate/${userId}`, null, { params });
  }

  getNatureHeureRequests(userId: number): Observable<NatureHeureRequest[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<NatureHeureRequest[]>(`${this.apiUrl}/retrieve-all-NatureHrsRequests`, { params });
  }

  getNatureHeureModifRequests(userId: number): Observable<NatureHeureModificationRequest[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<NatureHeureModificationRequest[]>(`${this.apiUrl}/retrieve-all-NatureHrsModifRequests`, { params });
  }

  getNatureHeureDelRequests(userId: number): Observable<NatureHeureDeletionRequest[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<NatureHeureDeletionRequest[]>(`${this.apiUrl}/retrieve-all-NatureHrsDelfRequests`, { params });
  }
}
