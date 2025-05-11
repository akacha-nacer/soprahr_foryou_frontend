import { Component } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  identifiant: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
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
      }
    );
  }
}
