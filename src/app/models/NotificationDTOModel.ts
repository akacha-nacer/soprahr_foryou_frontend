import {AbsenceDeclarationDTO} from './AbsenceDeclarationDTOModel';
import {NatureHeureRequest} from './journee/NatureHeureRequestModel';
import {NatureHeureModificationRequest} from './journee/NatureHeureModificationRequestModel';
import {NatureHeureDeletionRequest} from './journee/NatureHeureDeletionRequestModel';

export interface NotificationDTO {
  id: number;
  message: string;
  cloturee: boolean;
  createdAt: string;
  employeeId: number;
  employeeIdentifiant: string;
  employeeName: string;
  absenceDeclarations: AbsenceDeclarationDTO[] ;
  retard?:boolean;
  natureHeureRequest?: NatureHeureRequest; // New field for add requests
  natureHeureModificationRequest?: NatureHeureModificationRequest; // New field for modification requests
  natureHeureDeletionRequest?: NatureHeureDeletionRequest;
}
