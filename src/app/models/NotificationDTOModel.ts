import {AbsenceDeclarationDTO} from './AbsenceDeclarationDTOModel';

export interface NotificationDTO {
  id: number;
  message: string;
  cloturee: boolean;
  createdAt: string;
  employeeId: number;
  employeeName: string;
  isValidated?: boolean;
  absenceDeclarations: AbsenceDeclarationDTO[];
  retard?:boolean;
}
