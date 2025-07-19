import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {LoginResponseDTO} from '../models/LoginResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/user/login';
  private apiUrl1 = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {}

  login(identifiant: string, password: string): Observable<LoginResponseDTO> {
    const loginRequest = { identifiant, password };
    return this.http.post<LoginResponseDTO>(this.apiUrl, loginRequest).pipe(
      tap(response => {
        sessionStorage.setItem('user', JSON.stringify(response));
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    sessionStorage.removeItem('user');
  }

  getCurrentUser(): LoginResponseDTO | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getProfilePicture(userId: number): Observable<string> {
    return this.http.get(`${this.apiUrl1}/${userId}/profile-picture`, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  getManagerInfo(userId: number): Observable<LoginResponseDTO> {
    return this.http.get<LoginResponseDTO>(`${this.apiUrl1}/getManagerInfo/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  retrieveUser(id: number): Observable<LoginResponseDTO> {
    return this.http.get<LoginResponseDTO>(`${this.apiUrl1}/retrieve-User/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.status === 401) {
      errorMessage = 'Invalid identifiant or password';
    } else {
      errorMessage = error.error?.message || errorMessage;
    }
    return throwError(() => new Error(errorMessage));
  }
}
