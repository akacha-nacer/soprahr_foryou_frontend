import {NatureHeureRequest} from './NatureHeureRequestModel';
import {NatureHeureModificationRequest} from './NatureHeureModificationRequestModel';
import {NatureHeureDeletionRequest} from './NatureHeureDeletionRequestModel';

export interface JourneeNotificationDTO {
  id: number;
  nature_heure: string;
  heureDebut: string;
  heureFin: string;
  duree: string;
  commentaire:string ;
  date:string ;
  status:string ;
  userid:number ;
  userFirstname : string ;
  userlastname : string ;
  identifiant : string ;
}
