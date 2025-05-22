import {Component, HostListener, ViewEncapsulation} from '@angular/core';
import { trigger, state, style, animate, transition } from "@angular/animations"
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        opacity: 1,
        maxHeight: '500px', // Hauteur maximale suffisante pour le contenu
        overflow: 'hidden'
      })),
      state('out', style({
        opacity: 0,
        maxHeight: '0px',
        overflow: 'hidden'
      })),
      transition('out => in', [
        animate('300ms ease-in')
      ]),
      transition('in => out', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class NavbarComponent {

  constructor() {}
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Dropdown toggled:', this.isDropdownOpen);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdownButton = (event.target as HTMLElement).closest('.dropbtn');
    const dropdownContent = (event.target as HTMLElement).closest('.dropdown-content');


    if (!dropdownButton && !dropdownContent && this.isDropdownOpen) {
      this.isDropdownOpen = false;
      console.log('Dropdown closed (outside click):', this.isDropdownOpen);
    }


  }
}
