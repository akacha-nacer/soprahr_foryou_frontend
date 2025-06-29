export interface LoginResponseDTO {
  userID: number;
  firstname: string;
  lastname: string;
  identifiant: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'GESTIONNAIRE' | 'ADMIN'; // Matches the Role enum in backend
  message: string;
}
