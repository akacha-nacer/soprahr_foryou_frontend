import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-embauche',
  templateUrl: './embauche.component.html',
  styleUrls: ['./embauche.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass
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
export class EmbaucheComponent implements OnInit {
  dossierForm: FormGroup;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder) {
    this.dossierForm = this.fb.group({
      dateRecrutement: ['', [Validators.required, Validators.minLength(1)]], // Validation explicite pour date
      codeSociete: ['', [Validators.required, Validators.minLength(1)]],
      etablissement: ['', [Validators.required, Validators.minLength(1)]],
      matriculeSalarie: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Initialiser l'état de visibilité et de validation pour chaque section
    this.sectionVisibility['section1'] = false;
    this.sectionValidationStates['section1'] = false; // Par défaut, non validé (form_invalid)

    // Forcer la validation initiale en marquant tous les champs comme touchés
    this.dossierForm.markAllAsTouched();
  }

  toggleForm(sectionId: string): void {
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
  }

  onSubmit(sectionId: string): void {
    if (this.dossierForm.valid) {
      this.sectionValidationStates[sectionId] = true; // Valider la section (form_valid)
      console.log('Formulaire soumis avec succès :', this.dossierForm.value);
    } else {
      this.sectionValidationStates[sectionId] = false; // Non validé (form_invalid)
      console.log('Formulaire invalide');
    }
  }
}
