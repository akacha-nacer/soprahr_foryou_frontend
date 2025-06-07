import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgClass, CommonModule } from '@angular/common';

@Component({
  selector: 'app-maladie',
  templateUrl: './maladie.component.html',
  styleUrls: ['./maladie.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
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
  notifyForm: FormGroup;
  declareForm: FormGroup;
  justifyForm: FormGroup;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};
  activeProgressButton: string = 'Créer';
  showAccidentDate: boolean = false;

  constructor(private fb: FormBuilder) {
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
      this.sectionValidationStates[sectionId] = true;
      console.log(`Formulaire ${sectionId} soumis avec succès :`, form.value);
      this.sectionVisibility[sectionId] = false;
    } else {
      this.sectionValidationStates[sectionId] = false;
      console.log(`Formulaire ${sectionId} invalide`);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.justifyForm.get('justificatif')?.setValue(input.files[0].name);
    }
  }
}
