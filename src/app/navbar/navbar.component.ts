import {Component, HostListener, OnInit} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PopupQuestionRhComponent } from '../popup-question-rh/popup-question-rh.component';
import {PopupConfMaladieComponent} from '../popup-conf-maladie/popup-conf-maladie.component';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        maxHeight: '500px',
        opacity: 1,
        visibility: 'visible',
        overflow: 'hidden'
      })),
      state('out', style({
        maxHeight: '0px',
        opacity: 1,
        visibility: 'hidden',
        overflow: 'hidden'
      })),
      transition('out => in', [
        style({ overflow: 'hidden', opacity: 1, visibility: 'visible' }),
        animate('300ms linear')
      ]),
      transition('in => out', [
        style({ overflow: 'hidden', opacity: 1 }),
        animate('300ms linear', style({ maxHeight: '0px', visibility: 'hidden' }))
      ])
    ]),
    trigger('slideLeftRight', [
      state('in', style({
        width: '300px',
        opacity: 1,
        visibility: 'visible'
      })),
      state('out', style({
        width: '0px',
        opacity: 0,
        visibility: 'hidden'
      })),
      transition('out => in', [
        animate('300ms ease-in')
      ]),
      transition('in => out', [
        animate('300ms ease-out')
      ])
    ]),
    trigger('slideToggle', [
      state('off', style({
        transform: 'translateX(0)'
      })),
      state('on', style({
        transform: 'translateX(30px)'
      })),
      transition('off <=> on', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit{
  isDropdownOpen = false;
  isSearchOpen = false;
  isToggleOn = false;
  isSubDropdownOpen = false;
  isSubDropdownOpen1 = false;
  isSubDropdownOpen2 = false;
  isAnimatingSubDropdown = false;
  managerId: number | null = null;
  profilePicture: string | null = null;
  userFirstname: string | null = null;
  userIdentifiant: string | null = null;
  userPoste: string | null = null;
  userRole: string | null = null;

  constructor(private dialog: MatDialog,private router:Router, private authServcie:AuthService) {}

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
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isSubDropdownOpen = false;
      this.isSubDropdownOpen1 = false;
      this.isSubDropdownOpen2 = false;
    }
  }

  toggleSubDropdown(event: Event) {
    event.preventDefault();
    this.isAnimatingSubDropdown = true;
    this.isSubDropdownOpen = !this.isSubDropdownOpen;
    if (this.isSubDropdownOpen) {
      this.isSubDropdownOpen1 = false;
      this.isSubDropdownOpen2 = false;
    } else {
      // Close children when closing this dropdown
      this.isSubDropdownOpen1 = false;
      this.isSubDropdownOpen2 = false;
    }
    setTimeout(() => {
      this.isAnimatingSubDropdown = false;
    }, 300);
  }

  toggleSubDropdown1(event: Event) {
    event.preventDefault();
    this.isSubDropdownOpen1 = !this.isSubDropdownOpen1;
    if (this.isSubDropdownOpen1) {
      this.isSubDropdownOpen2 = false;
    } else {
      // Close child when closing this dropdown
      this.isSubDropdownOpen2 = false;
    }
  }

  toggleSubDropdown2(event: Event) {
    event.preventDefault();
    this.isSubDropdownOpen2 = !this.isSubDropdownOpen2;
  }

  toggleSearch(event: Event) {
    event.preventDefault();
    this.isSearchOpen = !this.isSearchOpen;
    console.log('Search toggled:', this.isSearchOpen);
  }

  toggleSwitch() {
    this.isToggleOn = !this.isToggleOn;
    console.log('Toggle switched:', this.isToggleOn);
  }

  openPopupQuestionRH(event: Event) {
    event.preventDefault();
    const dialogRef = this.dialog.open(PopupQuestionRhComponent, {
      width: '550px',
      backdropClass: 'custom-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Popup closed with result:', result);
    });
  }

  onSearchButtonClicked() {
    console.log('Search button clicked');
    this.isSearchOpen = false;
  }

  onInputClick(event: Event) {
    event.stopPropagation();
    console.log('Input clicked, propagation stopped');
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdownButton = (event.target as HTMLElement).closest('.dropbtn');
    const dropdownContent = (event.target as HTMLElement).closest('.dropdown-content');
    const searchLink = (event.target as HTMLElement).closest('.search-link');
    const searchInput = (event.target as HTMLElement).closest('.search-input');
    const searchField = (event.target as HTMLElement).closest('.search-field');


    if (!dropdownButton && !dropdownContent && this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.isSubDropdownOpen = false;
      this.isSubDropdownOpen1 = false;
      this.isSubDropdownOpen2 = false;
      console.log('Dropdown closed (outside click):', this.isDropdownOpen);
    }
    if (!searchLink && !searchInput && !searchField && this.isSearchOpen) {
      this.isSearchOpen = false;
      console.log('Search closed (outside click):', this.isSearchOpen);
    }
  }

  logout(){
    const dialogRef = this.dialog.open(PopupConfMaladieComponent, {
      width: '700px',
      data: { message: "Voulez-vous vous déconnecter de votre session ?" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authServcie.logout();
        this.router.navigate(['/auth']);
        sessionStorage.clear();
      }
    });
  }

  navigateToPage(route: string) {
    this.router.navigate([route]);

    this.isDropdownOpen = false;
    this.isSubDropdownOpen = false;
    this.isSubDropdownOpen1 = false;
    this.isSubDropdownOpen2 = false;

  }

}
