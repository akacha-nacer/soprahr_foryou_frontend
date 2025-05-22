import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AlertModule} from 'ngx-bootstrap/alert';
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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.submitted = true;
    this.authService.login(this.identifiant, this.password).subscribe(
      response => {
        if (response) {
          this.router.navigate(['/welcome']);
        } else {
          console.error('User not found');

        }
      },
      error => {
        console.error('Login failed:', error);
        this.showAlert();
      }
    );
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
