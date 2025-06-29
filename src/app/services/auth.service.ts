import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {LoginResponseDTO} from '../models/LoginResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/user/login';

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
