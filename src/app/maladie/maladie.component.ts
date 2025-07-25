import {Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MaladieService } from '../services/maladie.service';
import { AbsenceDeclaration } from '../models/AbsenceDeclarationModel';
import { Notification } from '../models/NotificationModel';
import { Justification } from '../models/JustificationModel';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfMaladieComponent } from '../popup-conf-maladie/popup-conf-maladie.component';
import {AuthService} from '../services/auth.service';
import {LoginResponseDTO} from '../models/LoginResponseDTO';
import {NotificationDTO} from '../models/NotificationDTOModel';
import {AbsenceDeclarationDTO} from '../models/AbsenceDeclarationDTOModel';
import {JustificationDTO} from '../models/JustificationDTO';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-maladie',
  templateUrl: './maladie.component.html',
  styleUrls: ['./maladie.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  animations: [
    trigger('slideDown', [
      state('hidden', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden'
      })),
      transition('hidden <=> visible', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class MaladieComponent implements OnInit {
  @ViewChild('fileUploadBtn') fileUploadBtn!: ElementRef;
  @ViewChild('uploadIcon') uploadIcon!: ElementRef;
  @ViewChild('fileNameText') fileNameText!: ElementRef;

  notifyForm: FormGroup;
  declareForm: FormGroup;
  justifyForm: FormGroup;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};
  isNotificationFormDisabled: boolean = false;
  isDeclarationFormDisabled: boolean = false;
  isJustifyFormDisabled: boolean = false;
  activeProgressButton: string = 'Créer';
  showAccidentDate: boolean = false;
  selectedFile: File | null = null;
  employeeId: number | null = null;
  absenceDeclarationId?: number | null = null;
  managerInfo: LoginResponseDTO | null = null;
  ManagerPicture: string | null = null;

  viewMode: 'current' | 'historique' | 'enCours' = 'current';
  allNotifications: NotificationDTO[] = [];
  allDeclarations: { declaration: AbsenceDeclarationDTO, notificationId: number }[] = [];
  allJustifications: { justification: JustificationDTO, declarationId: number }[] = [];
  // Pagination properties for notifications
  notificationsCurrentPage: number = 1;
  notificationsItemsPerPage: number = 5;
  notificationsTotalPages: number = 1;
  filteredNotifications: NotificationDTO[] = [];
  // Pagination properties for declarations
  declarationsCurrentPage: number = 1;
  declarationsItemsPerPage: number = 5;
  declarationsTotalPages: number = 1;
  filteredDeclarations: { declaration: AbsenceDeclarationDTO, notificationId: number }[] = [];
  // Pagination properties for justifications
  justificationsCurrentPage: number = 1;
  justificationsItemsPerPage: number = 5;
  justificationsTotalPages: number = 1;
  filteredJustifications: { justification: JustificationDTO, declarationId: number }[] = [];
  selectedNotificationId: number | null = null;
  selectedDeclarationId: number | null = null;
  selectedJustificationId: number | null = null;
  activeNotification: Notification | null = null;
  activeDeclaration: AbsenceDeclaration | null = null;

  maladieData = {
    notification: { message: '', retard: false } as Notification,
    absenceDeclaration: { isProlongation: false, dateDebut: '', dateFin: '' } as AbsenceDeclaration,
    justification: { contentType: '', originalDepose: false, accidentTravail: false, dateAccident: '' } as Justification
  };

  constructor(
    private fb: FormBuilder,
    private maladieService: MaladieService,
    private dialog: MatDialog,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.notifyForm = this.fb.group({
      message: ['Bonjour,\nJe suis malade aujourd\'hui. Je vous donne plus de précisions après ma visite chez le médecin.\nQ11CONGE01', [Validators.required]],
      retard: [false],
    });

    this.declareForm = this.fb.group({
      isProlongation: [false],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });

    this.justifyForm = this.fb.group({
      justificatif: ['', [Validators.required]],
      originalDepose: [false],
      accidentTravail: [false],
      dateAccident: ['']
    });
  }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('user');
    console.log('Stored user from sessionStorage:', storedUser);

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.employeeId = user.userID !== undefined && user.userID !== null ? parseInt(user.userID, 10) : null;
        console.log('Parsed employeeId:', this.employeeId);
        if (this.employeeId !== null && isNaN(this.employeeId)) {
          console.error('Invalid employeeId: not a number');
          this.employeeId = null;
        }
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        this.employeeId = null;
      }
    } else {
      console.error('No user found in sessionStorage');
      this.employeeId = null;
    }

    if (!this.employeeId) {
      console.error('Employee ID is null or invalid');
      alert('Erreur : Aucun ID d\'employé trouvé. Veuillez vous connecter.');
      return;
    }

    this.sectionVisibility['section1'] = false;
    this.sectionVisibility['section2'] = false;
    this.sectionVisibility['section3'] = false;
    this.sectionValidationStates['section1'] = false;
    this.sectionValidationStates['section2'] = false;
    this.sectionValidationStates['section3'] = false;

    this.notifyForm.markAllAsTouched();
    this.declareForm.markAllAsTouched();
    this.justifyForm.markAllAsTouched();

    this.justifyForm.get('accidentTravail')?.valueChanges.subscribe(value => {
      this.showAccidentDate = value;
      if (value) {
        this.justifyForm.get('dateAccident')?.setValidators([Validators.required]);
      } else {
        this.justifyForm.get('dateAccident')?.clearValidators();
      }
      this.justifyForm.get('dateAccident')?.updateValueAndValidity();
    });

    this.declareForm.get('dateDebut')?.valueChanges.subscribe(value => {
      const dateFinControl = this.declareForm.get('dateFin');
      if (value && dateFinControl?.value) { // Only validate if both fields have values
        const debut = new Date(value);
        dateFinControl.setValidators([
          Validators.required,
          (control) => {
            const fin = new Date(control.value);
            return fin >= debut ? null : { invalidDateRange: true };
          }
        ]);
        dateFinControl.updateValueAndValidity();
      } else {
        dateFinControl?.setValidators([Validators.required]);
        dateFinControl?.updateValueAndValidity();
      }
    });

    this.maladieService.getActiveNotification(this.employeeId).subscribe({
      next: (notification) => {
        if (notification) {
          this.sectionValidationStates['section1'] = true;
          this.sectionVisibility['section1'] = false;
          this.isNotificationFormDisabled = true;
          this.notifyForm.disable();
        }
        if (notification?.retard) {
          this.sectionVisibility['section1'] = false;
          this.sectionVisibility['section2'] = false;
          this.sectionVisibility['section3'] = false;
          this.isNotificationFormDisabled = true;
          this.isDeclarationFormDisabled = true;
          this.isJustifyFormDisabled = true;
          this.notifyForm.disable();
          this.declareForm.disable();
          this.justifyForm.disable();
        }
      },
      error: (error) => {
        console.error('Error fetching active notification:', error);
      }
    });

    this.authService.getManagerInfo(this.employeeId).subscribe({
      next: value => {
        this.managerInfo = value;
        this.authService.getProfilePicture(value.userID).subscribe({
          next: (picture) => {
            this.ManagerPicture = picture;
          },
          error: (err) => {
            console.error('Error fetching profile picture:', err);
            this.ManagerPicture = null;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching manager info:', err);
        this.managerInfo = null;
        this.ManagerPicture = null;
        alert('Erreur lors de la récupération des informations du manager.');
      }
    });

    this.maladieService.getActiveAbsenceDeclaration(this.employeeId).subscribe({
      next: (declaration) => {
        if (declaration && declaration.id) {
          this.absenceDeclarationId = declaration.id;
          this.sectionValidationStates['section2'] = true;
          this.sectionVisibility['section2'] = false;
          this.isDeclarationFormDisabled = true;
          this.declareForm.disable();
        }
      },
      error: (error) => {
        console.error('Error fetching active absence declaration:', error);
      }
    });
  }

  toggleViewMode(mode: 'current' | 'historique' | 'enCours'): void {
    this.viewMode = mode;
    this.activeProgressButton = mode === 'current' ? 'Créer' : mode === 'historique' ? 'Historique' : 'En Cours';
    if (mode === 'historique') {
      this.fetchHistoriqueData();
    }
    if (mode === 'enCours') {
      this.fetchEnCoursData();
    }
  }

  private fetchHistoriqueData(): void {
    if (!this.employeeId) return;
    this.maladieService.getAllNotifications(this.employeeId).subscribe({
      next: (notifications) => {
        this.allNotifications = notifications;
        this.filteredNotifications = [...notifications]; // Initialize filtered data
        this.updateNotificationsPagination();
        this.processNotifications();
        this.updateDeclarationsPagination();
        this.updateJustificationsPagination();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  private fetchEnCoursData(): void {
    if (!this.employeeId) return;

    this.maladieService.getActiveNotification(this.employeeId).subscribe({
      next: (notification) => {
        this.activeNotification = notification;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching active notification:', error);
        this.activeNotification = null;
      }
    });

    this.maladieService.getActiveAbsenceDeclaration(this.employeeId).subscribe({
      next: (declaration) => {
        this.activeDeclaration = declaration;
        console.log(this.activeDeclaration?.validated);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching active declaration:', error);
        this.activeDeclaration = null;
      }
    });
  }

  // Pagination methods for notifications
  get paginatedNotifications(): NotificationDTO[] {
    const startIndex = (this.notificationsCurrentPage - 1) * this.notificationsItemsPerPage;
    const endIndex = startIndex + this.notificationsItemsPerPage;
    return this.filteredNotifications.slice(startIndex, endIndex);
  }

  updateNotificationsPagination(): void {
    this.notificationsTotalPages = Math.ceil(this.filteredNotifications.length / this.notificationsItemsPerPage);
    if (this.notificationsCurrentPage > this.notificationsTotalPages) {
      this.notificationsCurrentPage = this.notificationsTotalPages > 0 ? this.notificationsTotalPages : 1;
    }
  }

  get notificationsPageNumbers(): number[] {
    return Array.from({ length: this.notificationsTotalPages }, (_, i) => i + 1);
  }

  goToNotificationsPage(page: number): void {
    if (page >= 1 && page <= this.notificationsTotalPages) {
      this.notificationsCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  dateRangeValidator(form: FormGroup): { [key: string]: boolean } | null {
    const dateDebut = form.get('dateDebut')?.value;
    const dateFin = form.get('dateFin')?.value;
    const currentYear = 2025; // Based on provided date of July 21, 2025

    if (dateDebut && dateFin) { // Only validate if both fields have values
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);

      // Check if dates are within the current year
      if (debut.getFullYear() !== currentYear || fin.getFullYear() !== currentYear) {
        return { invalidYear: true };
      }

      // Check if dateFin is not before dateDebut
      if (fin < debut) {
        return { invalidDateRange: true };
      }
    }
    return null;
  }

  // Pagination methods for declarations
  get paginatedDeclarations(): { declaration: AbsenceDeclarationDTO, notificationId: number }[] {
    const startIndex = (this.declarationsCurrentPage - 1) * this.declarationsItemsPerPage;
    const endIndex = startIndex + this.declarationsItemsPerPage;
    return this.filteredDeclarations.slice(startIndex, endIndex);
  }

  updateDeclarationsPagination(): void {
    this.declarationsTotalPages = Math.ceil(this.filteredDeclarations.length / this.declarationsItemsPerPage);
    if (this.declarationsCurrentPage > this.declarationsTotalPages) {
      this.declarationsCurrentPage = this.declarationsTotalPages > 0 ? this.declarationsTotalPages : 1;
    }
  }

  get declarationsPageNumbers(): number[] {
    return Array.from({ length: this.declarationsTotalPages }, (_, i) => i + 1);
  }

  goToDeclarationsPage(page: number): void {
    if (page >= 1 && page <= this.declarationsTotalPages) {
      this.declarationsCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  // Pagination methods for justifications
  get paginatedJustifications(): { justification: JustificationDTO, declarationId: number }[] {
    const startIndex = (this.justificationsCurrentPage - 1) * this.justificationsItemsPerPage;
    const endIndex = startIndex + this.justificationsItemsPerPage;
    return this.filteredJustifications.slice(startIndex, endIndex);
  }

  updateJustificationsPagination(): void {
    this.justificationsTotalPages = Math.ceil(this.filteredJustifications.length / this.justificationsItemsPerPage);
    if (this.justificationsCurrentPage > this.justificationsTotalPages) {
      this.justificationsCurrentPage = this.justificationsTotalPages > 0 ? this.justificationsTotalPages : 1;
    }
  }

  get justificationsPageNumbers(): number[] {
    return Array.from({ length: this.justificationsTotalPages }, (_, i) => i + 1);
  }

  goToJustificationsPage(page: number): void {
    if (page >= 1 && page <= this.justificationsTotalPages) {
      this.justificationsCurrentPage = page;
      this.cdr.detectChanges();
    }
  }

  private processNotifications(): void {
    this.allDeclarations = [];
    this.allJustifications = [];
    this.allNotifications.forEach(notification => {
      notification.absenceDeclarations.forEach(declaration => {
        this.allDeclarations.push({ declaration, notificationId: notification.id });
        declaration.justifications.forEach(justification => {
          this.allJustifications.push({ justification, declarationId: declaration.id });
        });
      });
    });
    this.filteredDeclarations = [...this.allDeclarations]; // Initialize filtered declarations
    this.filteredJustifications = [...this.allJustifications]; // Initialize filtered justifications
  }

  selectNotification(id: number): void {
    this.selectedNotificationId = id;
    this.selectedDeclarationId = null;
    this.selectedJustificationId = null;
    this.cdr.detectChanges();
  }

  selectDeclaration(id: number): void {
    this.selectedDeclarationId = id;
    this.selectedJustificationId = null;
    const decl = this.allDeclarations.find(d => d.declaration.id === id);
    if (decl) {
      this.selectedNotificationId = decl.notificationId;
    }
    this.cdr.detectChanges();
  }

  selectJustification(id: number): void {
    this.selectedJustificationId = id;
    const just = this.allJustifications.find(j => j.justification.id === id);
    if (just) {
      this.selectedDeclarationId = just.declarationId;
      const decl = this.allDeclarations.find(d => d.declaration.id === just.declarationId);
      if (decl) {
        this.selectedNotificationId = decl.notificationId;
      }
    }
    this.cdr.detectChanges();
  }

  toggleForm(sectionId: string): void {
    if (sectionId === 'section1' && this.isNotificationFormDisabled) return;
    if (sectionId === 'section2' && this.isDeclarationFormDisabled) return;
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
  }

  onSubmit(sectionId: string): void {
    if (!this.employeeId) {
      this.toastr.error('Veuillez vous connecter.', 'Erreur : Aucun ID d\'employé trouvé');
      return;
    }

    let form: FormGroup;
    if (sectionId === 'section1') form = this.notifyForm;
    else if (sectionId === 'section2') form = this.declareForm;
    else if (sectionId === 'section3') form = this.justifyForm;
    else return;

    if (form.valid) {
      const confirmationMessages = {
        'section1': 'Voulez-vous notifier votre manager de votre absence ?',
        'section2': 'Voulez-vous déclarer votre arrêt de travail ?',
        'section3': 'Voulez-vous soumettre votre justificatif ?'
      };

      const dialogRef = this.dialog.open(PopupConfMaladieComponent, {
        width: '700px',
        data: { message: confirmationMessages[sectionId] }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.submitFormData(sectionId, form);
        } else {
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else {
      this.sectionValidationStates[sectionId] = false;
      this.toastr.error(`Veuillez remplir tous les champs requis pour ${sectionId}.`, 'Formulaire Invalide');
    }
  }

  private submitFormData(sectionId: string, form: FormGroup): void {
    if (!this.employeeId) return;

    this.updateMaladieData(sectionId, form.value);

    if (sectionId === 'section1') {
      this.maladieService.saveNotification(this.maladieData.notification, this.employeeId).subscribe({
        next: (response: Notification) => {
          this.toastr.success('Notification soumise avec succès.', 'Succès');
          this.sectionValidationStates[sectionId] = true;
          this.sectionVisibility[sectionId] = false;
          this.isNotificationFormDisabled = true;
          this.notifyForm.disable();
          if (response.retard) {
            this.isJustifyFormDisabled = true;
            this.isDeclarationFormDisabled = true;
          }
        },
        error: (error: any) => {
          this.toastr.error('Erreur lors de la soumission de la notification.', 'Erreur');
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else if (sectionId === 'section2') {
      this.maladieService.saveAbsenceDeclaration(this.maladieData.absenceDeclaration, this.employeeId).subscribe({
        next: (response: AbsenceDeclaration) => {
          this.toastr.success('Déclaration d\'absence soumise avec succès.', 'Succès');
          this.absenceDeclarationId = response.id;
          this.sectionValidationStates[sectionId] = true;
          this.sectionVisibility[sectionId] = false;
          this.isDeclarationFormDisabled = true;
          this.declareForm.disable();
        },
        error: (error: any) => {
          this.toastr.error('Erreur lors de la soumission de la déclaration d\'absence.', 'Erreur');
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else if (sectionId === 'section3') {
      if (!this.absenceDeclarationId) {
        this.maladieService.getActiveAbsenceDeclaration(this.employeeId).subscribe({
          next: (declaration) => {
            if (declaration && declaration.id) {
              this.absenceDeclarationId = declaration.id;
              this.submitJustification(sectionId);
            } else {
              this.toastr.error('Aucune déclaration d\'absence active.', 'Erreur');
              this.sectionValidationStates[sectionId] = false;
            }
          },
          error: (error) => {
            this.toastr.error('Impossible de récupérer la déclaration d\'absence active.', 'Erreur');
            this.sectionValidationStates[sectionId] = false;
          }
        });
      } else {
        this.submitJustification(sectionId);
      }
    }
  }

  private submitJustification(sectionId: string): void {
    if (!this.absenceDeclarationId) return;

    const formData = new FormData();
    const justificatif = this.justifyForm.get('justificatif')?.value;
    if (justificatif instanceof File) {
      formData.append('justificatif', justificatif);
    }
    formData.append('originalDepose', this.maladieData.justification.originalDepose.toString());
    formData.append('accidentTravail', this.maladieData.justification.accidentTravail.toString());
    if (this.maladieData.justification.dateAccident) {
      formData.append('dateAccident', this.maladieData.justification.dateAccident);
    }

    this.maladieService.saveJustification(formData, this.absenceDeclarationId).subscribe({
      next: (response: string) => {
        this.toastr.success('Justificatif soumis avec succès.', 'Succès');
        this.sectionValidationStates[sectionId] = true;
        this.sectionVisibility[sectionId] = false;
      },
      error: (error: any) => {
        this.toastr.error('Erreur lors de la soumission de la justification.', 'Erreur');
        this.sectionValidationStates[sectionId] = false;
      }
    });
  }

  private updateMaladieData(sectionId: string, formValue: any): void {
    switch (sectionId) {
      case 'section1':
        this.maladieData.notification = { message: formValue.message, retard: formValue.retard };
        break;
      case 'section2':
        this.maladieData.absenceDeclaration = { ...this.maladieData.absenceDeclaration, ...formValue };
        break;
      case 'section3':
        this.maladieData.justification = {
          ...this.maladieData.justification,
          contentType: this.selectedFile ? this.selectedFile.type : '',
          originalDepose: formValue.originalDepose,
          accidentTravail: formValue.accidentTravail,
          dateAccident: formValue.dateAccident
        };
        break;
    }
  }

  areAllSectionsValid(): boolean {
    return Object.values(this.sectionValidationStates).every(state => state);
  }

  cloturerMaladie(): void {
    if (this.employeeId) {
      this.maladieService.closeSickLeave(this.employeeId).subscribe({
        next: () => {
          this.toastr.success('Arrêt maladie clôturé avec succès.', 'Succès');
          this.resetForms();
          this.isNotificationFormDisabled = false;
          this.isDeclarationFormDisabled = false;
          this.isJustifyFormDisabled = false;
          this.notifyForm.enable();
          this.declareForm.enable();
        },
        error: () => {
          this.toastr.error('Erreur lors de la clôturation de l\'arrêt maladie.', 'Erreur');
        }
      });
    } else {
      this.toastr.error('Erreur lors de la clôturation : Aucun ID d\'employé trouvé.', 'Erreur');
    }
  }

  resetForms(): void {
    this.notifyForm.reset({
      message: 'Bonjour,\nJe suis malade aujourd\'hui. Je vous donne plus de précisions après ma visite chez le médecin.\nQ11CONGE01'
    });
    this.declareForm.reset();
    this.justifyForm.reset();
    this.sectionVisibility = {
      'section1': false,
      'section2': false,
      'section3': false
    };
    this.sectionValidationStates = {
      'section1': false,
      'section2': false,
      'section3': false
    };
    this.maladieData = {
      notification: { message: '' },
      absenceDeclaration: { isProlongation: false, dateDebut: '', dateFin: '' },
      justification: { contentType: '', originalDepose: false, accidentTravail: false, dateAccident: '' }
    };
    this.activeProgressButton = 'Créer';
    this.selectedFile = null;
    this.absenceDeclarationId = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.justifyForm.get('justificatif')?.setValue(this.selectedFile);

      if (this.uploadIcon && this.fileNameText) {
        this.uploadIcon.nativeElement.src = this.selectedFile ? 'assets/images/uploaded_file.png' : 'assets/images/upload1.png';
        this.fileNameText.nativeElement.textContent = this.selectedFile
          ? this.selectedFile.name.substring(0, 20) + (this.selectedFile.name.length > 20 ? '...' : '')
          : 'Choisir un fichier';
      }
    }
  }
}
