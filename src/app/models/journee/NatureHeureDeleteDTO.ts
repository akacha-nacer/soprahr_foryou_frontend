import {NatureHeureRequest} from './NatureHeureRequestModel';
import {NatureHeureModificationRequest} from './NatureHeureModificationRequestModel';
import {NatureHeureDeletionRequest} from './NatureHeureDeletionRequestModel';

export interface NatureHeureDeleteDTO {
  id: number;
  approved: boolean;
  rejected: boolean;
  requestedById: number;
  userFirstname : string ;
  userlastname : string ;
  identifiant : string ;

}
