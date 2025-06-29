import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AlertModule} from 'ngx-bootstrap/alert';
import {LoginResponseDTO} from '../models/LoginResponseDTO';
type ExampleAlertType = { type: string; msg: string };

@Component({
  selector: 'app-login',
  imports: [
    FormsModule, CommonModule,AlertModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  identifiant: string = '';
  password: string = '';
  submitted = false ;
  showDangerAlert = false;
  dismissible = true;
  showForgotMessage = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.submitted = true;
    this.authService.login(this.identifiant,this.password).subscribe({
      next: (response: LoginResponseDTO)=>{
        this.router.navigate(['/espace_manager'])
      },
      error: (error:any) =>{
        this.errorMessage = error.message || 'Login failed';
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
