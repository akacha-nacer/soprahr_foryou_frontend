export interface NatureHeure {
  id?: number;
  nature_heure: string;
  heureDebut: string; // ISO time string, e.g., "18:00:00"
  heureFin: string;
  duree: string;
  date? : string;
  isValidee: boolean;
  commentaire: string;
}
