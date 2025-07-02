export interface Notification {
  id?: number;
  message: string;
  cloturee?: boolean;
  createdAt?: string;
  employeeId?: number;
  recipientId?: number;
  isValidated?: boolean;
  retard?:boolean;
}
