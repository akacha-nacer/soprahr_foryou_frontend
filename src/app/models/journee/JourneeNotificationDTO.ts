import {NatureHeureRequest} from './NatureHeureRequestModel';
import {NatureHeureModificationRequest} from './NatureHeureModificationRequestModel';
import {NatureHeureDeletionRequest} from './NatureHeureDeletionRequestModel';

export interface JourneeNotificationDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeIdentifiant: string;
  createdAt: string; // ISO datetime string
  requestType: 'ADD' | 'MODIFY' | 'DELETE'; // Type of request
  natureHeureRequest?: NatureHeureRequest; // For ADD requests
  modificationRequest?: NatureHeureModificationRequest; // For MODIFY requests
  deletionRequest?: NatureHeureDeletionRequest; // For DELETE requests
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
