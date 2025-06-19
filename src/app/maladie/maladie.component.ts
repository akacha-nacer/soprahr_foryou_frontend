import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MaladieService } from '../services/maladie.service';
import { AbsenceDeclaration } from '../models/AbsenceDeclarationModel';
import { Notification } from '../models/NotificationModel';
import { Justification } from '../models/JustificationModel';
import { MatDialog } from '@angular/material/dialog';
import {PopupConfMaladieComponent} from '../popup-conf-maladie/popup-conf-maladie.component';

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
  activeProgressButton: string = 'Créer';
  showAccidentDate: boolean = false;
  selectedFile: File | null = null;

  // Data model to store form values with proper initialization
  maladieData = {
    notification: { message: '' } as Notification,
    absenceDeclaration: { isProlongation: false, dateDebut: '', dateFin: '' } as AbsenceDeclaration,
    justification: { justificatifFileName: '', originalDepose: false, accidentTravail: false, dateAccident: '' } as Justification
  };

  constructor(
    private fb: FormBuilder,
    private maladieService: MaladieService,
    private dialog: MatDialog
  ) {
    this.notifyForm = this.fb.group({
      message: ['Bonjour,\nJe suis malade aujourd\'hui. Je vous donne plus de précisions après ma visite chez le médecin.\nQ11CONGE01', [Validators.required]]
    });

    this.declareForm = this.fb.group({
      isProlongation: [false],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]]
    });

    this.justifyForm = this.fb.group({
      justificatif: ['', [Validators.required]],
      originalDepose: [false, [Validators.requiredTrue]],
      accidentTravail: [false],
      dateAccident: ['']
    });
  }

  ngOnInit(): void {
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
  }

  toggleForm(sectionId: string): void {
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
  }

  onSubmit(sectionId: string): void {
    let form: FormGroup;
    if (sectionId === 'section1') form = this.notifyForm;
    else if (sectionId === 'section2') form = this.declareForm;
    else if (sectionId === 'section3') form = this.justifyForm;
    else return;

    if (form.valid) {
      // Define confirmation messages for each section
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
        if (result) { // User clicked "Oui"
          this.submitFormData(sectionId, form);
        } else { // User clicked "Annuler" or closed the popup
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else {
      this.sectionValidationStates[sectionId] = false;
      console.log(`Formulaire ${sectionId} invalide`);
    }
  }

  private submitFormData(sectionId: string, form: FormGroup): void {
    this.updateMaladieData(sectionId, form.value);

    // API calls for each section
    if (sectionId === 'section1') {
      this.maladieService.saveNotification(this.maladieData.notification).subscribe({
        next: (response: string) => {
          console.log('Notification submitted:', response);
          this.sectionValidationStates[sectionId] = true;
          this.sectionVisibility[sectionId] = false;
        },
        error: (error: any) => {
          console.error('Error submitting notification:', error);
          alert('Erreur lors de la soumission de la notification.');
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else if (sectionId === 'section2') {
      this.maladieService.saveAbsenceDeclaration(this.maladieData.absenceDeclaration).subscribe({
        next: (response: string) => {
          console.log('Absence declaration submitted:', response);
          this.sectionValidationStates[sectionId] = true;
          this.sectionVisibility[sectionId] = false;
        },
        error: (error: any) => {
          console.error('Error submitting absence declaration:', error);
          alert('Erreur lors de la soumission de la déclaration d\'absence.');
          this.sectionValidationStates[sectionId] = false;
        }
      });
    } else if (sectionId === 'section3') {
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

      this.maladieService.saveJustification(formData).subscribe({
        next: (response: string) => {
          console.log('Justification submitted:', response);
          const fileNameMatch = response.match(/File: (\S+)/);
          if (fileNameMatch && fileNameMatch[1]) {
            this.maladieData.justification.justificatifFileName = fileNameMatch[1];
          }
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
  }

  private updateMaladieData(sectionId: string, formValue: any): void {
    switch (sectionId) {
      case 'section1':
        this.maladieData.notification = { message: formValue.message };
        break;
      case 'section2':
        this.maladieData.absenceDeclaration = { ...this.maladieData.absenceDeclaration, ...formValue };
        break;
      case 'section3':
        this.maladieData.justification = {
          ...this.maladieData.justification,
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
      justification: { justificatifFileName: '', originalDepose: false, accidentTravail: false, dateAccident: '' }
    };
    this.activeProgressButton = 'Créer';
    this.selectedFile = null;
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
