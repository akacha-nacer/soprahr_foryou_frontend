import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DossierModel} from '../models/DossierModel';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmbaucheService {
  private apiUrl = 'http://localhost:8080/4you/embauche_detaillée';

  constructor(private http: HttpClient) {}

  saveDossier(dossier: DossierModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_emb`, dossier, { responseType: 'text' });
  }

}
