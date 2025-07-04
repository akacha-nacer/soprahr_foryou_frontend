import {JustificationDTO} from './JustificationDTO';

export interface AbsenceDeclarationDTO {
  id: number;
  isProlongation: boolean;
  dateDebut: string;
  dateFin: string;
  cloturee: boolean;
  isValidated?: boolean;
  justifications: JustificationDTO[];
}
