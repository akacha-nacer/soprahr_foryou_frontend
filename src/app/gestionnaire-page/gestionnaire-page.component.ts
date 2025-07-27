import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {MaladieService} from '../services/maladie.service';
import {AuthService} from '../services/auth.service';
import {JourneeService} from '../services/journee.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-gestionnaire-page',
  imports: [
    NgIf
  ],
  standalone: true,
  templateUrl: './gestionnaire-page.component.html',
  styleUrl: './gestionnaire-page.component.css'
})
export class GestionnairePageComponent implements OnInit{
  managerId: number | null = null;
  profilePicture: string | null = null;
  userFirstname: string | null = null;
  userIdentifiant: string | null = null;
  userPoste: string | null = null;
  userRole: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService, private  router:Router) {}


  ngOnInit() {
    const storedUser = sessionStorage.getItem('user');
    console.log('Stored user from sessionStorage:', storedUser);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.managerId = user.userID !== undefined && user.userID !== null ? parseInt(user.userID, 10) : null;
        this.userFirstname = user.firstname !== undefined && user.firstname !== null ? user.firstname : null;
        this.userIdentifiant = user.identifiant !== undefined && user.identifiant !== null ? user.identifiant : null;
        this.userPoste = user.poste !== undefined && user.poste !== null ? user.poste : null;
        this.userRole = user.role !== undefined && user.role !== null ? user.role : null;
        console.log(this.managerId);
      } catch (e) {
        console.error('Error parsing user from sessionStorage:', e);
      }
    } else {
      console.warn('No user found in sessionStorage');
    }
    if (this.managerId != null){
    this.authService.getProfilePicture(this.managerId).subscribe({
      next: (picture) => {
        this.profilePicture = picture;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching profile picture:', err);
        this.profilePicture = null;
        this.cdr.detectChanges();
      }
    });
    }

  }

}
