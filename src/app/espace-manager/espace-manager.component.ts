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
import {JourneeNotificationDTO} from '../models/journee/JourneeNotificationDTO';
import {NatureHeureDeletionRequest} from '../models/journee/NatureHeureDeletionRequestModel';
import {NatureHeureDeleteDTO} from '../models/journee/NatureHeureDeleteDTO';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

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
  selectedNatureHeureModifReq: JourneeNotificationDTO | null = null;
  selectednatureHeureDeletionReq: NatureHeureDeleteDTO | null = null;
  natureHeureRequests: NatureHeureRequest[] = [];
  natureHeureModificationRequests: JourneeNotificationDTO[] = [];
  natureHeureDeletionRequests: NatureHeureDeleteDTO[] = [];
  managerId: number | null = null;
  profilePicture: string | null = null;
  userFirstname: string | null = null;
  userIdentifiant: string | null = null;
  userPoste: string | null = null;
  userRole: string | null = null;
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
  demarcheItemsEmpl: string[] = [
    'Mes questions RH',
    'Le planning de mes collègues',
    'Mes congés',
    'Ma journée',
    'Mon planning hebdomadaire',
    'Mes attestations',
    'Je suis malade',
    'Mon mode de transport',
    'Mon déménagement'
  ];
  filteredDemarcheItems: string[] = [...this.demarcheItems];
  filteredDemarcheEmplItems: string[] = [...this.demarcheItemsEmpl];

  constructor(private cdr: ChangeDetectorRef,private toastr: ToastrService, private maladieService: MaladieService, private authService: AuthService,private  journeeService :JourneeService, private  router:Router) {}

  ngOnInit() {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.managerId = user.userID !== undefined && user.userID !== null ? parseInt(user.userID, 10) : null;
        this.userFirstname = user.firstname !== undefined && user.firstname !== null ? user.firstname : null;
        this.userIdentifiant = user.identifiant !== undefined && user.identifiant !== null ? user.identifiant : null;
        this.userPoste = user.poste !== undefined && user.poste !== null ? user.poste : null;
        this.userRole = user.role !== undefined && user.role !== null ? user.role : null;
      } catch (e) {
        this.toastr.error('Erreur lors de l’analyse des données utilisateur.', 'Erreur');
      }
    } else {
      this.toastr.warning('Aucun utilisateur trouvé dans sessionStorage.', 'Avertissement');
    }

    if (this.managerId !== null) {
      this.authService.getProfilePicture(this.managerId).subscribe({
        next: (picture) => {
          this.profilePicture = picture;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la récupération de la photo de profil.', 'Erreur');
          this.profilePicture = null;
          this.cdr.detectChanges();
        }
      });
      this.maladieService.getNotificationsWithDeclarations(this.managerId).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          notifications.forEach(notification => {
            if (notification.employeeId && !this.employeePictures.has(notification.employeeId)) {
              this.authService.getProfilePicture(notification.employeeId).subscribe({
                next: (picture) => {
                  this.employeePictures.set(notification.employeeId, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération de la photo pour l’employé ${notification.employeeId}.`, 'Erreur');
                  this.employeePictures.set(notification.employeeId, null);
                  this.cdr.detectChanges();
                }
              });
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la récupération des notifications.', 'Erreur');
        }
      });

      this.journeeService.getPendingRequests(this.managerId).subscribe({
        next: (natureHeureRequest) => {
          this.natureHeureRequests = natureHeureRequest;
          natureHeureRequest.forEach((request, index) => {
            if (request.userid) {
              this.authService.getProfilePicture(request.userid).subscribe({
                next: (picture) => {
                  this.employeePictures.set(request.userid, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération de la photo pour l’utilisateur ${request.userid}.`, 'Erreur');
                  this.employeePictures.set(request.userid, null);
                  this.cdr.detectChanges();
                }
              });

              this.authService.retrieveUser(request.userid).subscribe({
                next: (user) => {
                  request.userFirstname = user.firstname;
                  request.userlastname = user.lastname;
                  request.identifiant = user.identifiant;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération des informations pour l’utilisateur ${request.userid}.`, 'Erreur');
                  this.employeePictures.set(request.userid, null);
                  this.cdr.detectChanges();
                }
              });
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la récupération des demandes de nature d’heures.', 'Erreur');
        }
      });

      this.journeeService.getPendingModificationRequests(this.managerId).subscribe({
        next: (natureHeureModifRequest) => {
          this.natureHeureModificationRequests = natureHeureModifRequest;
          natureHeureModifRequest.forEach((request, index) => {
            if (request.userid) {
              this.authService.getProfilePicture(request.userid).subscribe({
                next: (picture) => {
                  this.employeePictures.set(request.userid, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération de la photo pour l’utilisateur ${request.userid}.`, 'Erreur');
                  this.employeePictures.set(request.userid, null);
                  this.cdr.detectChanges();
                }
              });

              this.authService.retrieveUser(request.userid).subscribe({
                next: (user) => {
                  request.userFirstname = user.firstname;
                  request.userlastname = user.lastname;
                  request.identifiant = user.identifiant;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération des informations pour l’utilisateur ${request.userid}.`, 'Erreur');
                  this.employeePictures.set(request.userid, null);
                  this.cdr.detectChanges();
                }
              });
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la récupération des demandes de modification de nature d’heures.', 'Erreur');
        }
      });

      this.journeeService.getPendingDeletionRequests(this.managerId).subscribe({
        next: (natureHeuredelRequest) => {
          this.natureHeureDeletionRequests = natureHeuredelRequest;
          natureHeuredelRequest.forEach((request, index) => {
            if (request.requestedById) {
              this.authService.getProfilePicture(request.requestedById).subscribe({
                next: (picture) => {
                  this.employeePictures.set(request.requestedById, picture);
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération de la photo pour l’utilisateur ${request.requestedById}.`, 'Erreur');
                  this.employeePictures.set(request.requestedById, null);
                  this.cdr.detectChanges();
                }
              });

              this.authService.retrieveUser(request.requestedById).subscribe({
                next: (user) => {
                  request.userFirstname = user.firstname;
                  request.userlastname = user.lastname;
                  request.identifiant = user.identifiant;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  this.toastr.error(`Erreur lors de la récupération des informations pour l’utilisateur ${request.requestedById}.`, 'Erreur');
                  this.employeePictures.set(request.requestedById, null);
                  this.cdr.detectChanges();
                }
              });
            }
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Erreur lors de la récupération des demandes de suppression de nature d’heures.', 'Erreur');
        }
      });
    } else {
      this.toastr.warning('Impossible de récupérer les données : ID du manager non défini.', 'Avertissement');
    }
  }

  refuser_fermer_Notif(notification: NotificationDTO) {
    if (this.isAnimating) return;
    this.maladieService.refuseNotification(notification.id).subscribe({
      next: () => {
        notification.isValidated = true;
        this.toastr.success('Notification refusée avec succès.', 'Succès');
        this.cdr.detectChanges();
        location.reload();
      },
      error: (err) => {
        this.toastr.error('Erreur lors du refus de la notification.', 'Erreur');
      }
    });
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

  selectNatureModifHeureRequest(request: JourneeNotificationDTO) {
    if (this.isAnimating) return;
    this.selectedNatureHeureModifReq = request;
    this.selectedNatureHeureRequest = null;
    this.selectedNotification = null;
    this.showDeclarations = true;
    this.showDemands = false;
    this.currentSection = 'declarations';
    this.cdr.markForCheck();
  }

  selectNatureDelHeureRequest(request: NatureHeureDeleteDTO) {
    if (this.isAnimating) return;
    this.selectednatureHeureDeletionReq = request;
    this.selectedNatureHeureModifReq = null;
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
        this.toastr.success('Demande de nature d’heure approuvée avec succès.', 'Succès');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de l’approbation de la demande de nature d’heure.', 'Erreur');
      }
    });
  }


  approveModifRequest(request: JourneeNotificationDTO) {
    if (this.isAnimating || request.status !== 'PENDING') return;
    this.journeeService.approveModificationRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.status = 'APPROVED';
        this.toastr.success('Demande de modification approuvée avec succès.', 'Succès');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de l’approbation de la demande de modification.', 'Erreur');
      }
    });
  }

  approveDelRequest(request: NatureHeureDeleteDTO) {
    if (this.isAnimating || request.approved || request.rejected) return;
    this.journeeService.approveDeletionRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.approved = true;
        request.rejected = false;
        this.toastr.success('Demande de suppression approuvée avec succès.', 'Succès');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de l’approbation de la demande de suppression.', 'Erreur');
      }
    });
  }

  rejectDelRequest(request: NatureHeureDeleteDTO) {
    if (this.isAnimating || request.approved || request.rejected) return;
    this.journeeService.rejectDeletionRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.approved = false;
        request.rejected = true;
        this.toastr.success('Demande de suppression rejetée avec succès.', 'Succès');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Erreur lors du rejet de la demande de suppression.', 'Erreur');
      }
    });
  }


  rejectModifRequest(request: JourneeNotificationDTO) {
    if (this.isAnimating || request.status !== 'PENDING') return;
    this.journeeService.rejectModificationRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.status = 'REJECTED';
        this.toastr.success('Demande de modification rejetée avec succès.', 'Succès');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Erreur lors du rejet de la demande de modification.', 'Erreur');
      }
    });
  }
  rejectAddRequest(request: NatureHeureRequest) {
    if (this.isAnimating || request.status !== 'PENDING') return;
    this.journeeService.rejectNatureHeureRequest(request.id!, this.managerId).subscribe({
      next: () => {
        request.status = 'REJECTED';
        this.toastr.success('Demande de nature d’heure rejetée avec succès.', 'Succès');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastr.error('Erreur lors du rejet de la demande de nature d’heure.', 'Erreur');
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

  filterDemarcheEmplItems() {
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredDemarcheEmplItems = this.demarcheItemsEmpl.filter(item =>
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
        return 'assets/images/planningE1.png';
      case 'Je gère le temps de travail de mon équipe':
        return 'assets/images/tempsD.png';
      case 'Je consulte les compteurs de mon équipe':
        return 'assets/images/compteurD.png';
      case 'Je gère les fins de période d\'essai de mon équipe':
        return 'assets/images/periodeD.png';
      case 'Je gère les fins de contrats de mon équipe':
        return 'assets/images/contratD.png';
      case 'Je gère les départs de mon équipe':
        return 'assets/images/leaveD.png';
      case 'Ma journée':
        return 'assets/images/journeeD.png';
      case 'Mon planning hebdomadaire':
        return 'assets/images/hebdoD.png';
      case 'Mes attestations':
        return 'assets/images/attestationD.png';
      case 'Je suis malade':
        return 'assets/images/maladeD.png';
      case 'Mon mode de transport':
        return 'assets/images/transportD.png';
      case 'Mon déménagement':
        return 'assets/images/demeD.png';
      default:
        return 'assets/images/conge2.png';
    }
  }

  isDeclarationValidatable(notification: NotificationDTO): boolean {
    return (
      !notification.retard &&
      !notification.cloturee &&
        !notification.isValidated &&
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
      this.toastr.error('Aucune déclaration d’absence associée.', 'Erreur');
      return;
    }

    const declarationId = notification.absenceDeclarations[0].id;
    this.maladieService.validateDeclaration(declarationId).subscribe({
      next: () => {
        notification.absenceDeclarations[0].isValidated = true;
        notification.isValidated = true;
        this.toastr.success('Déclaration validée avec succès.', 'Succès');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la validation de la déclaration.', 'Erreur');
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


  demarcheItemsRedirection(item: string){
      switch (item){
        case  "Ma journée" :
          return this.router.navigate(['/4you/journee']);
        case  "Je suis malade" :
          return this.router.navigate(['/4you/maladie']);
        default:
          return this.router.navigate(['/4you/mon-espace']);
      }

  }


}
