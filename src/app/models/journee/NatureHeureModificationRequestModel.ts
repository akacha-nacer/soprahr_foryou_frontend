export interface NatureHeureModificationRequest {
  id?: number;
  newNatureHeure: string;
  newHeureDebut: string;
  newHeureFin: string;
  newDuree: string;
  newCommentaire: string;
  approved: boolean;
  rejected: boolean;
  requestedAt?: string;
}
