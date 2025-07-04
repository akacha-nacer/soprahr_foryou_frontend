import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MaladieService } from '../services/maladie.service';
import { AbsenceDeclaration } from '../models/AbsenceDeclarationModel';
import { Notification } from '../models/NotificationModel';
import { Justification } from '../models/JustificationModel';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfMaladieComponent } from '../popup-conf-maladie/popup-conf-maladie.component';

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
  activeProgressButton: string = 'Créer';
  showAccidentDate: boolean = false;
  selectedFile: File | null = null;
  employeeId: number | null = null;
  absenceDeclarationId?: number | null = null;

  maladieData = {
    notification: { message: '', retard: false } as Notification,
    absenceDeclaration: { isProlongation: false, dateDebut: '', dateFin: '' } as AbsenceDeclaration,
    justification: { contentType: '', originalDepose: false, accidentTravail: false, dateAccident: '' } as Justification
  };

  constructor(
    private fb: FormBuilder,
    private maladieService: MaladieService,
    private dialog: MatDialog
  ) {
    this.notifyForm = this.fb.group({
      message: ['Bonjour,\nJe suis malade aujourd\'hui. Je vous donne plus de précisions après ma visite chez le médecin.\nQ11CONGE01', [Validators.required]],
      retard: [false],
    });

    this.declareForm = this.fb.group({
      isProlongation: [false],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]]
    });

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

    // Check for active notification
    this.maladieService.getActiveNotification(this.employeeId).subscribe({
      next: (notification) => {
        if (notification) {
          this.sectionValidationStates['section1'] = true;
          this.sectionVisibility['section1'] = false;
          this.isNotificationFormDisabled = true;
          this.notifyForm.disable();
        }
      },
      error: (error) => {
        console.error('Error fetching active notification:', error);
      }
    });

    // Check for active absence declaration
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

  toggleForm(sectionId: string): void {
    // Only toggle if the section is not disabled
    if (sectionId === 'section1' && this.isNotificationFormDisabled) return;
    if (sectionId === 'section2' && this.isDeclarationFormDisabled) return;
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
  }

  onSubmit(sectionId: string): void {
    if (!this.employeeId) {
      alert('Erreur : Aucun ID d\'employé trouvé. Veuillez vous connecter.');
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
      console.log(`Formulaire ${sectionId} invalide`);
    }
  }

  private submitFormData(sectionId: string, form: FormGroup): void {
    if (!this.employeeId) return;

    this.updateMaladieData(sectionId, form.value);

    if (sectionId === 'section1') {
      this.maladieService.saveNotification(this.maladieData.notification, this.employeeId).subscribe({
        next: (response: Notification) => {
          console.log('Notification submitted:', response);
          this.sectionValidationStates[sectionId] = true;
          this.sectionVisibility[sectionId] = false;
          this.isNotificationFormDisabled = true;
          this.notifyForm.disable();
        },
        error: (error: any) => {
          console.error('Error submitting notification:', error);
          alert('Erreur lors de la soumission de la notification.');
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else if (sectionId === 'section2') {
      this.maladieService.saveAbsenceDeclaration(this.maladieData.absenceDeclaration, this.employeeId).subscribe({
        next: (response: AbsenceDeclaration) => {
          console.log('Absence declaration submitted:', response);
          this.absenceDeclarationId = response.id;
          this.sectionValidationStates[sectionId] = true;
          this.sectionVisibility[sectionId] = false;
          this.isDeclarationFormDisabled = true;
          this.declareForm.disable();
        },
        error: (error: any) => {
          console.error('Error submitting absence declaration:', error);
          alert('Erreur lors de la soumission de la déclaration d\'absence.');
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else if (sectionId === 'section3') {
      if (!this.absenceDeclarationId) {
        this.maladieService.getActiveAbsenceDeclaration(this.employeeId).subscribe({
          next: (declaration) => {
            if (declaration && declaration.id) {
              this.absenceDeclarationId = declaration.id;
              console.log(this.absenceDeclarationId);
              this.submitJustification(sectionId);
            } else {
              alert('Erreur : Aucune déclaration d\'absence active.');
              this.sectionValidationStates[sectionId] = false;
            }
          },
          error: (error) => {
            console.error('Error fetching active absence declaration:', error);
            alert('Erreur : Impossible de récupérer la déclaration d\'absence active.');
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
        console.log('Justification submitted:', response);
        this.sectionValidationStates[sectionId] = true;
        this.sectionVisibility[sectionId] = false;
      },
      error: (error: any) => {
        console.error('Error submitting justification:', error);
        alert('Erreur lors de la soumission de la justification.');
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
          alert('Succès de la clôturation');
          this.resetForms();
          // Re-enable forms after closing
          this.isNotificationFormDisabled = false;
          this.isDeclarationFormDisabled = false;
          this.notifyForm.enable();
          this.declareForm.enable();
        },
        error: () => {
          alert('Erreur lors de la clôturation');
        }
      });
    } else {
      alert('Erreur lors de la clôturation');
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
