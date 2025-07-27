import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AlertModule} from 'ngx-bootstrap/alert';
import {LoginResponseDTO} from '../models/LoginResponseDTO';
type ExampleAlertType = { type: string; msg: string };

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, CommonModule,AlertModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent  implements OnInit{

  identifiant: string = '';
  password: string = '';
  submitted = false ;
  showDangerAlert = false;
  dismissible = true;
  showForgotMessage = false;
  errorMessage: string = '';

  ngOnInit() {
    sessionStorage.clear();
  }

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.submitted = true;
    this.showDangerAlert = false;
    this.authService.login(this.identifiant, this.password).subscribe({
      next: (response: LoginResponseDTO) => {
        // Store user data in sessionStorage
        const user = {
          userID: response.userID,
          firstname: response.firstname,
          identifiant: response.identifiant,
          poste: response.poste,
          role: response.role || 'USER' // Default to 'USER' if role is undefined
        };
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log('User stored in sessionStorage:', sessionStorage.getItem('user'));
        console.log('Navigating to /4you/mon-espace');
        this.router.navigate(['/4you/mon-espace']).then(success => {
          if (!success) {
            console.error('Navigation to /4you/mon-espace failed');
            this.errorMessage = 'Redirection échouée. Veuillez réessayer.';
            this.showDangerAlert = true;
            sessionStorage.clear();
          }
        });
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Échec de la connexion';
        this.showDangerAlert = true;
        console.error('Login error:', error);
      }
    });
  }

  showAlert(): void {
    this.showDangerAlert = true;
  }

  onClosed(): void {
    this.showDangerAlert = false;
  }

  onForgotPassword(): void {
    this.showForgotMessage = !this.showForgotMessage;
  }

}
