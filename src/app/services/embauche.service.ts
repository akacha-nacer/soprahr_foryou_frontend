import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DossierModel} from '../models/DossierModel';
import {Observable} from 'rxjs';
import {DepartementNaiss} from '../models/DepartementNaiss';

@Injectable({
  providedIn: 'root'
})
export class EmbaucheService {
  private apiUrl = 'http://localhost:8080/4you/embauche_detaillée';

  constructor(private http: HttpClient) {}

  saveDossier(dossier: DossierModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_emb`, dossier, { responseType: 'text' });
  }

  RetrieveDepartementNaiss(): Observable<DepartementNaiss[]> {
    return this.http.get<DepartementNaiss[]>(`${this.apiUrl}/get_dep`);
  }

  getAllDossiers(): Observable<DossierModel[]> {
    return this.http.get<DossierModel[]>(`${this.apiUrl}/get_dossiers`);
  }
}
