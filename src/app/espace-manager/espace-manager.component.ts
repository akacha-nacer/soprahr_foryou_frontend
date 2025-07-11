import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { MaladieService } from '../services/maladie.service';
import { NotificationDTO } from '../models/NotificationDTOModel';
import { AuthService } from '../services/auth.service';
import {JourneeService} from '../services/journee.service';
import {NatureHeureRequest} from '../models/journee/NatureHeureRequestModel';
import {NatureHeureModificationRequest} from '../models/journee/NatureHeureModificationRequestModel';

@Component({
  selector: 'app-espace-manager',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule to imports
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
  selectedNatureHeureRequest: NatureHeureRequest | null = null;
  selectedNatureHeureModifReq: NatureHeureModificationRequest | null = null;
  natureHeureRequests: NatureHeureRequest[] = [];
  natureHeureModificationRequests: NatureHeureModificationRequest[] = [];
  managerId: number | null = null;
  profilePicture: string | null = null;
  userFirstname: string | null = null;
  userIdentifiant: string | null = null;
  userPoste: string | null = null;
  searchTerm: string = '';
  employeePictures: Map<number, string | null> = new Map();
  demarcheItems: string[] = [
    'Mes questions RH',
    'Le planning de mes collègues',
    'Mes congés',
    'Je gère le planning de mon équipe',
    'Je gère le temps de travail de mon équipe',
    'Je consulte les compteurs de mon équipe',
    'Je gère les fins de période d\'essai de mon équipe',
    'Je gère les fins de contrats de mon équipe',
    'Je gère les départs de mon équipe',
    'Ma journée',
    'Mon planning hebdomadaire',
    'Mes attestations',
    'Je suis malade',
    'Mon mode de transport',
    'Mon déménagement'
  ];
  filteredDemarcheItems: string[] = [...this.demarcheItems];

  constructor(private cdr: ChangeDetectorRef, private maladieService: MaladieService, private authService: AuthService,private  journeeService :JourneeService) {}

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
        console.log(this.managerId);
      } catch (e) {
        console.error('Error parsing user from sessionStorage:', e);
      }
    } else {
      console.warn('No user found in sessionStorage');
    }

    if (this.managerId !== null) {
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
      this.maladieService.getNotificationsWithDeclarations(this.managerId).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          console.log('Notifications:', notifications);
          // Fetch profile picture for each employee
          notifications.forEach(notification => {
            if (notification.employeeId && !this.employeePictures.has(notification.employeeId)) {
              this.authService.getProfilePicture(notification.employeeId).subscribe({
                next: (picture) => {
                  this.employeePictures.set(notification.employeeId, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error(`Error fetching picture for employeeId ${notification.employeeId}:`, err);
                  this.employeePictures.set(notification.employeeId, null);
                  this.cdr.detectChanges();
                }
              });
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching notifications:', err);
          alert('Erreur lors de la récupération des notifications.');
        }
      });

      this.journeeService.getPendingRequests(this.managerId).subscribe({
        next: (natureHeureRequest) => {
          this.natureHeureRequests = natureHeureRequest;
          console.log('natureHeureRequests:', natureHeureRequest);
          console.log('Number of requests:', natureHeureRequest.length);
          natureHeureRequest.forEach((request, index) => {
            console.log(`Request ${index}:`, request);
            console.log(`Request ${index} userid:`, request.userid);
            if (request.userid) {
              console.log("teest:", request.userid);
              this.authService.getProfilePicture(request.userid).subscribe({
                next: (picture) => {
                  console.log(`Profile picture for userid ${request.userid}:`, picture);
                  this.employeePictures.set(request.userid, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error(`Error fetching picture for userid ${request.userid}:`, err);
                  this.employeePictures.set(request.userid, null);
                  this.cdr.detectChanges();
                }
              });
            } else {
              console.warn(`No userid for request ${index}`);
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching natureHeureRequests:', err);
          alert('Erreur lors de la récupération des demandes de nature d\'heures.');
        }
      });


      this.journeeService.getPendingModificationRequests(this.managerId).subscribe({
        next: (natureHeureModifRequest) => {
          this.natureHeureModificationRequests = natureHeureModifRequest;
          console.log(natureHeureModifRequest);
          natureHeureModifRequest.forEach((request, index) => {
            if (request.requestedById) {
              this.authService.getProfilePicture(request.requestedById).subscribe({
                next: (picture) => {
                  console.log(`Profile picture for userid ${request.requestedById}:`, picture);
                  this.employeePictures.set(request.requestedById, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error(`Error fetching picture for userid ${request.requestedById}:`, err);
                  this.employeePictures.set(request.requestedById, null);
                  this.cdr.detectChanges();
                }
              });
            } else {
              console.warn(`No userid for request ${index}`);
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching natureHeureRequests:', err);
          alert('Erreur lors de la récupération des demandes de nature d\'heures.');
        }
      });


    } else {
      console.warn('Cannot fetch notifications: managerId is null');
    }



  }


  selectNatureHeureRequest(request: NatureHeureRequest) {
    if (this.isAnimating) return;
    this.selectedNatureHeureRequest = request;
    this.selectedNotification = null; // Clear notification selection
    this.showDeclarations = true;
    this.showDemands = false;
    this.currentSection = 'declarations';
    this.cdr.markForCheck();
  }

  selectNatureModifHeureRequest(request: NatureHeureModificationRequest) {
    if (this.isAnimating) return;
    this.selectedNatureHeureModifReq = request;
    this.selectedNatureHeureRequest = null;
    this.selectedNotification = null;
    this.showDeclarations = true;
    this.showDemands = false;
    this.currentSection = 'declarations';
    this.cdr.markForCheck();
  }


  approveAddRequest(request: NatureHeureRequest) {
    if (this.isAnimating || request.status !== 'PENDING') return;
    this.journeeService.approveNatureHeureRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.status = 'APPROVED';
        this.cdr.markForCheck();
        alert('Demande approuvée avec succès.');
      },
      error: (err) => {
        console.error('Error approving request:', err);
        alert('Erreur lors de l\'approbation de la demande.');
      }
    });
  }

  approveModifRequest(request: NatureHeureModificationRequest) {
    if (this.isAnimating || request.rejected || request.approved) return;
    this.journeeService.approveModificationRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.approved = true ;
        request.rejected = false ;
        this.cdr.markForCheck();
        alert('Demande approuvée avec succès.');
      },
      error: (err) => {
        console.error('Error approving request:', err);
        alert('Erreur lors de l\'approbation de la demande.');
      }
    });
  }


  rejectModifRequest(request: NatureHeureModificationRequest) {
    if (this.isAnimating || request.rejected || request.approved) return;
    this.journeeService.rejectModificationRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.approved = false ;
        request.rejected = true ;
        this.cdr.markForCheck();
        alert('Demande rejetée avec succès.');
      },
      error: (err) => {
        console.error('Error rejecting request:', err);
        alert('Erreur lors du rejet de la demande.');
      }
    });
  }
  rejectAddRequest(request: NatureHeureRequest) {
    if (this.isAnimating || request.status !== 'PENDING') return;
    this.journeeService.rejectNatureHeureRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.status = 'REJECTED';
        this.cdr.markForCheck();
        alert('Demande rejetée avec succès.');
      },
      error: (err) => {
        console.error('Error rejecting request:', err);
        alert('Erreur lors du rejet de la demande.');
      }
    });
  }

  filterDemarcheItems() {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredDemarcheItems = this.demarcheItems.filter(item =>
      item.toLowerCase().includes(search)
    );
    this.cdr.detectChanges();
  }
  getImageForDemarcheItem(item: string): string {
    switch (item) {
      case 'Mes questions RH':
        return 'assets/images/wha.png';
      case 'Le planning de mes collègues':
        return 'assets/images/plc1.png';
      case 'Je gère le planning de mon équipe':
        return 'assets/images/calender.png';
      default:
        return 'assets/images/conge2.png';
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
    if (this.isAnimating) return;
    this.selectedNotification = notification;
    this.selectedNatureHeureRequest = null; // Clear natureHeureRequest selection
    this.showDeclarations = true;
    this.showDemands = false;
    this.currentSection = 'declarations';
    this.cdr.markForCheck();
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
    this.selectedNotification = null;
    this.selectedNatureHeureRequest = null;
    this.currentSection = 'demands';
    this.cdr.markForCheck();
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

  getEmployeePicture(employeeId: number | null): string | null {
    return employeeId ? this.employeePictures.get(employeeId) || null : null;
  }


}
