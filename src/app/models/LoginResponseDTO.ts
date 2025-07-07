export interface LoginResponseDTO {
  userID: number;
  firstname: string;
  lastname: string;
  identifiant: string;
  email: string;
  poste: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'GESTIONNAIRE' | 'ADMIN';
  message: string;
}
