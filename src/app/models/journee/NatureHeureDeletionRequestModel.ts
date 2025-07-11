import {NatureHeure} from './NatureHeureModel';
import {LoginResponseDTO} from '../LoginResponseDTO';

export interface NatureHeureDeletionRequest {
  id?: number;
  originalNatureHeureId?: number; // Reference to the original NatureHeure
  originalNatureHeure?: NatureHeure;
  requestedById?: number; // Reference to the employee who made the request
  approved: boolean;
  rejected: boolean;
  requestedAt?: string;
}
