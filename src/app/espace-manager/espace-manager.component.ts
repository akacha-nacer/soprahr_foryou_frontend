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

  isDeclarationValidatable(notification: NotificationDTO): boolean {
    return (
      !notification.retard &&
      !notification.cloturee &&
      notification.absenceDeclarations?.length > 0 &&
      !notification.absenceDeclarations[0]?.isValidated &&
      !notification.absenceDeclarations[0]?.cloturee
    );
  }

  get hasJustifications(): boolean {
    return (
      this.selectedNotification != null &&
      this.selectedNotification.absenceDeclarations != null &&
      this.selectedNotification.absenceDeclarations.length > 0 &&
      this.selectedNotification.absenceDeclarations[0].justifications != null &&
      this.selectedNotification.absenceDeclarations[0].justifications.length > 0
    );
  }

  isDeclarationValidatedOrClosed(notification: NotificationDTO): boolean {
    return <boolean>(
      notification.absenceDeclarations?.length > 0 &&
      (notification.absenceDeclarations[0]?.isValidated || notification.absenceDeclarations[0]?.cloturee)
    );
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
    if (this.isAnimating ) return;
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


  downloadJustification(justificationId: number) {
    this.maladieService.downloadJustification(justificationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `justification_${justificationId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading justification:', err);
        alert('Erreur lors du téléchargement du justificatif.');
      }
    });
  }
  validateNotification(notification: NotificationDTO) {
    if (this.isAnimating) return;

    if (!notification.absenceDeclarations || notification.absenceDeclarations.length === 0) {
      console.error('No absence declarations found for notification:', notification);
      alert('Erreur : Aucune déclaration d\'absence associée.');
      return;
    }

    const declarationId = notification.absenceDeclarations[0].id;
    this.maladieService.validateDeclaration(declarationId).subscribe({
      next: () => {
        notification.absenceDeclarations[0].isValidated = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error validating declaration:', err);
        alert('Erreur lors de la validation de la déclaration.');
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
