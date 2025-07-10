import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {NatureHeure} from '../models/journee/NatureHeureModel';
import {catchError, Observable, throwError} from 'rxjs';
import {map} from 'd3';
import {NatureHeureModificationRequest} from '../models/journee/NatureHeureModificationRequestModel';
import {Anomalies} from '../models/journee/AnomaliesModel';
import {Pointage} from '../models/journee/PointageModel';

@Injectable({
  providedIn: 'root'
})
export class JourneeService {

  private apiUrl = 'http://localhost:8080/api/journee';
  constructor(private http: HttpClient) { }

  saveNatureHeure(natureHeure: NatureHeure, userId: number): Observable<string> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post(`${this.apiUrl}/save_nature_heure`, natureHeure, { params, responseType: 'text' });
  }


  updateNatureHeure(id: number, natureHeure: NatureHeure, userId: number): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.put(`${this.apiUrl}/update_nature_heure/${id}`, natureHeure, { params });
  }


  requestNatureHeureUpdate(request: NatureHeureModificationRequest, userId: number, natureHeureId: number): Observable<string> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('natureHeureId', natureHeureId.toString());
    return this.http.post(`${this.apiUrl}/request_update_nature_heure`, request, { params, responseType: 'text' });
  }


  approveRequest(requestId: number, userId: number): Observable<string> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post(`${this.apiUrl}/approve_request/${requestId}`, null, { params, responseType: 'text' });
  }


  getNatureHeures(userId: number): Observable<NatureHeure[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<NatureHeure[]>(`${this.apiUrl}/retrieve-all-NatureHrs`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAnomalies(userId: number): Observable<Anomalies[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Anomalies[]>(`${this.apiUrl}/retrieve-all-Anomalies`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getPointages(userId: number): Observable<Pointage[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Pointage[]>(`${this.apiUrl}/retrieve-all-Pointages`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nServer Message: ${error.error}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
