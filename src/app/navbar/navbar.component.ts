import { Component, HostListener } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PopupQuestionRhComponent } from '../popup-question-rh/popup-question-rh.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
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
        opacity: 0,
        visibility: 'hidden',
        overflow: 'hidden'
      })),
      transition('out => in', [
        animate('300ms ease-in')
      ]),
      transition('in => out', [
        animate('300ms ease-out')
      ])
    ]),
    trigger('slideLeftRight', [
      state('in', style({
        width: '200px',
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
export class NavbarComponent {
  isDropdownOpen = false;
  isSearchOpen = false;
  isToggleOn = false;

  constructor(private dialog: MatDialog) {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Dropdown toggled:', this.isDropdownOpen);
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
      backdropClass: 'custom-backdrop' // Custom overlay class
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Popup closed with result:', result);
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdownButton = (event.target as HTMLElement).closest('.dropbtn');
    const dropdownContent = (event.target as HTMLElement).closest('.dropdown-content');
    const searchButton = (event.target as HTMLElement).closest('.search-link');

    if (!dropdownButton && !dropdownContent && this.isDropdownOpen) {
      this.isDropdownOpen = false;
      console.log('Dropdown closed (outside click):', this.isDropdownOpen);
    }
    if (!searchButton && this.isSearchOpen) {
      this.isSearchOpen = false;
      console.log('Search closed (outside click):', this.isSearchOpen);
    }
  }
}
