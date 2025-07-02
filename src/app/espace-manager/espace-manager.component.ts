import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { MaladieService } from '../services/maladie.service';
import { NotificationDTO } from '../models/NotificationDTOModel';

@Component({
  selector: 'app-espace-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './espace-manager.component.html',
  styleUrls: ['./espace-manager.component.css'],
  animations: [
    trigger('notificationSlide', [
      state('visible', style({ transform: 'translateX(0%)', opacity: 1, zIndex: 2 })),
      state('hidden', style({ transform: 'translateX(-100%)', opacity: 1, zIndex: 1 })),
      transition('visible <=> hidden', [animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)')])
    ]),
    trigger('demandSlide', [
      state('visible', style({ transform: 'translateX(0%)', opacity: 1, zIndex: 2 })),
      state('hidden', style({ transform: 'translateX(100%)', opacity: 1, zIndex: 1 })),
      state('hiddenLeft', style({ transform: 'translateX(-100%)', opacity: 1, zIndex: 1 })),
      transition('visible <=> hidden', [animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)')]),
      transition('visible <=> hiddenLeft', [animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)')])
    ]),
    trigger('declarationSlide', [
      state('hidden', style({ transform: 'translateX(100%)', opacity: 1, zIndex: 1 })),
      state('visible', style({ transform: 'translateX(0%)', opacity: 1, zIndex: 2 })),
      transition('hidden <=> visible', [animate('0.9s cubic-bezier(0.25, 0.8, 0.25, 1)')])
    ])
  ]
})
export class EspaceManagerComponent implements OnInit {
  showDemands = false;
  showDeclarations = false;
  isAnimating = false;
  currentSection: 'notifications' | 'demands' | 'declarations' = 'notifications';
  selectedNotification: NotificationDTO | null = null;
  notifications: NotificationDTO[] = [];
  managerId: number | null = null;

  constructor(private cdr: ChangeDetectorRef, private maladieService: MaladieService) {}

  ngOnInit() {
    const storedUser = sessionStorage.getItem('user');
    console.log('Stored user from sessionStorage:', storedUser);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.managerId = user.userID !== undefined && user.userID !== null ? parseInt(user.userID, 10) : null;
      } catch (e) {
        console.error('Error parsing user from sessionStorage:', e);
      }
    } else {
      console.warn('No user found in sessionStorage');
    }

    if (this.managerId !== null) {
      this.maladieService.getNotificationsWithDeclarations(this.managerId).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          console.log(notifications);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching notifications:', err);
          alert('Erreur lors de la récupération des notifications.');
        }
      });
    } else {
      console.warn('Cannot fetch notifications: managerId is null');
    }
  }

  toggleDemands() {
    if (this.isAnimating) return;
    this.showDemands = !this.showDemands;
    this.showDeclarations = false;
    this.selectedNotification = null;
    this.currentSection = this.showDemands ? 'demands' : 'notifications';
    this.cdr.detectChanges();
  }

  showDeclaration(notification: NotificationDTO) {
    if (this.isAnimating || notification.retard || notification.cloturee || !notification.isValidated) return;
    this.selectedNotification = notification;
    this.showDeclarations = true;
    this.showDemands = false;
    this.currentSection = 'declarations';
    this.cdr.detectChanges();
  }

  goBackFromDemands() {
    if (this.isAnimating || !this.showDemands) return;
    this.showDemands = false;
    this.showDeclarations = false;
    this.selectedNotification = null;
    this.currentSection = 'notifications';
    this.cdr.detectChanges();
  }

  goBackFromDeclarations() {
    if (this.isAnimating || !this.showDeclarations) return;
    this.showDeclarations = false;
    this.showDemands = true;
    this.currentSection = 'demands';
    this.cdr.detectChanges();
  }

  validateNotification(notification: NotificationDTO) {
    if (this.isAnimating) return;
    this.maladieService.validateNotification(notification.id).subscribe({
      next: () => {
        notification.isValidated = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error validating notification:', err);
        alert('Erreur lors de la validation de la notification.');
      }
    });
  }

  animationStart(event: AnimationEvent) {
    this.isAnimating = true;
  }

  animationDone(event: AnimationEvent) {
    this.isAnimating = false;
    this.cdr.detectChanges();
  }

  get notificationState(): string {
    return this.currentSection === 'notifications' ? 'visible' : 'hidden';
  }

  get demandState(): string {
    return this.currentSection === 'demands' ? 'visible' :
      this.currentSection === 'declarations' ? 'hiddenLeft' : 'hidden';
  }

  get declarationState(): string {
    return this.currentSection === 'declarations' ? 'visible' : 'hidden';
  }
}
