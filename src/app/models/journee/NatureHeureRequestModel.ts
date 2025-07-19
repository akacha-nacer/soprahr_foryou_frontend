import {LoginResponseDTO} from '../LoginResponseDTO';

export interface NatureHeureRequest {
  id?: number;
  nature_heure: string;
  heureDebut: string;
  heureFin: string;
  duree: string;
  commentaire: string;
  date?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  userid: number;
  managerId?: number;
  userFirstname : string ;
  userlastname : string ;
  identifiant : string ;
}
