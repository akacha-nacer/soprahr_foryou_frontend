import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/user/login';

  constructor(private http: HttpClient) {}

  login(identifiant: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { identifiant, password });
  }
}
