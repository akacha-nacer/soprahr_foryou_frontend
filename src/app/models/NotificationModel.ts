export interface Notification {
  id?: number;
  message: string;
  cloturee?: boolean;
  createdAt?: string;
  isValidated?: boolean;
  employeeId?: number;
  recipientId?: number;
  retard?:boolean;
}
