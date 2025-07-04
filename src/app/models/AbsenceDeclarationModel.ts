export interface AbsenceDeclaration {
  id?: number;
  isProlongation: boolean;
  dateDebut: string;
  dateFin: string;
  cloturee?: boolean;
  employeeId?: number;
  notificationId?: number;
  isValidated?: boolean;
}
