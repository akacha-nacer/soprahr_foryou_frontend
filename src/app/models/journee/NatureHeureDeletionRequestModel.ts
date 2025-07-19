import {NatureHeure} from './NatureHeureModel';
import {LoginResponseDTO} from '../LoginResponseDTO';

export interface NatureHeureDeletionRequest {
  id?: number;
  originalNatureHeureId?: number;
  originalNatureHeure?: NatureHeure;
  requestedById: number;
  approved: boolean;
  rejected: boolean;
  requestedAt?: string;
  userFirstname : string ;
  userlastname : string ;
  identifiant : string ;
}
