import {NatureHeure} from './NatureHeureModel';
import {LoginResponseDTO} from '../LoginResponseDTO';

export interface NatureHeureModificationRequest {
  id?: number;
  newNatureHeure: string;
  newHeureDebut: string;
  newHeureFin: string;
  newDuree: string;
  newCommentaire: string;
  newDate?: string;
  approved: boolean;
  rejected: boolean;
  requestedAt?: string;
  originalNatureHeureId?: number;
  requestedById: number;
}
