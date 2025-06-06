import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgClass, CommonModule } from '@angular/common';

@Component({
  selector: 'app-embauche',
  templateUrl: './embauche.component.html',
  styleUrls: ['./embauche.component.css'],
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
    ]),
    trigger('slideHeader', [
      state('hidden', style({
        transform: 'translateY(-100%)',
        opacity: 0,
        height: '0px',
        overflow: 'hidden'
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1,
        height: '*',
        overflow: 'hidden'
      })),
      transition('hidden => visible', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class EmbaucheComponent implements OnInit {
  dossierForm: FormGroup;
  individualInfoForm: FormGroup;
  addressForm: FormGroup;
  assignmentForm: FormGroup;
  careerForm: FormGroup;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};
  showAdditionalSections: boolean = false;
  section2AnimationState: string = 'hidden';
  section3AnimationState: string = 'hidden';
  section4AnimationState: string = 'hidden';
  section5AnimationState: string = 'hidden';

  // Ajout de l'état pour les boutons de progression
  activeProgressButton: string = 'Créer'; // Par défaut, "Créer" est actif

  constructor(private fb: FormBuilder) {
    this.dossierForm = this.fb.group({
      dateRecrutement: ['', [Validators.required, Validators.minLength(1)]],
      codeSociete: ['', [Validators.required, Validators.minLength(1)]],
      etablissement: ['', [Validators.required, Validators.minLength(1)]],
      matriculeSalarie: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.individualInfoForm = this.fb.group({
      qualite: ['', [Validators.required, Validators.minLength(1)]],
      nomUsuel: ['', [Validators.required, Validators.minLength(1)]],
      nomPatronymique: ['', [Validators.required, Validators.minLength(1)]],
      prenom: ['', [Validators.required, Validators.minLength(1)]],
      deuxiemePrenom: ['', [Validators.required, Validators.minLength(1)]],
      sexe: ['', [Validators.required]],
      numeroInsee: ['', [Validators.required, Validators.minLength(1)]],
      dateNaissance: ['', [Validators.required, Validators.minLength(1)]],
      villeNaissance: ['', [Validators.required, Validators.minLength(1)]],
      departementNaissance: ['', [Validators.required, Validators.minLength(1)]],
      paysNaissance: ['', [Validators.required, Validators.minLength(1)]],
      paysNationalite: ['', [Validators.required, Validators.minLength(1)]],
      etatFamilial: ['', [Validators.required]],
      dateEffet: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.addressForm = this.fb.group({
      pays: ['', [Validators.required, Validators.minLength(1)]],
      typeAdresse: ['', [Validators.required, Validators.minLength(1)]],
      adressePrincipale: ['', [Validators.required]],
      valableDu: ['', [Validators.required, Validators.minLength(1)]],
      valableAu: ['', [Validators.required, Validators.minLength(1)]],
      numeroVoie: ['', [Validators.required, Validators.minLength(1)]],
      natureVoie: ['', [Validators.required, Validators.minLength(1)]],
      complement1: ['', [Validators.required, Validators.minLength(1)]],
      complement2: ['', [Validators.required, Validators.minLength(1)]],
      lieuDit: ['', [Validators.required, Validators.minLength(1)]],
      codePostal: ['', [Validators.required, Validators.minLength(1)]],
      commune: ['', [Validators.required, Validators.minLength(1)]],
      codeInseeCommune: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.assignmentForm = this.fb.group({
      categorieEntree: ['', [Validators.required, Validators.minLength(1)]],
      motifEntree: ['', [Validators.required, Validators.minLength(1)]],
      poste: ['', [Validators.required, Validators.minLength(1)]],
      emploi: ['', [Validators.required, Validators.minLength(1)]],
      uniteOrganisationnelle: ['', [Validators.required, Validators.minLength(1)]],
      calendrierPaie: ['', [Validators.required, Validators.minLength(1)]],
      codeCycle: ['', [Validators.required, Validators.minLength(1)]],
      indexe: ['', [Validators.required]],
      modaliteGestion: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.careerForm = this.fb.group({
      conventionCollective: ['', [Validators.required, Validators.minLength(1)]],
      accordEntreprise: ['', [Validators.required, Validators.minLength(1)]],
      qualification: ['', [Validators.required, Validators.minLength(1)]],
      typePaie: ['', [Validators.required, Validators.minLength(1)]],
      regimeSpecial: ['', [Validators.required, Validators.minLength(1)]],
      natureContrat: ['', [Validators.required, Validators.minLength(1)]],
      typeContrat: ['', [Validators.required, Validators.minLength(1)]],
      duree: ['', [Validators.required, Validators.minLength(1)]],
      dateFinPrevue: ['', [Validators.required, Validators.minLength(1)]],
      dateDebutEssai: ['', [Validators.required, Validators.minLength(1)]],
      dateFinEssai: ['', [Validators.required, Validators.minLength(1)]],
      typeTemps: ['', [Validators.required, Validators.minLength(1)]],
      modaliteHoraire: ['', [Validators.required, Validators.minLength(1)]],
      forfaitJours: ['', [Validators.required]],
      forfaitHeures: ['', [Validators.required, Validators.min(0)]],
      surcotisation: ['', [Validators.required, Validators.minLength(1)]],
      heuresTravaillees: ['', [Validators.required, Validators.minLength(1)]],
      heuresPayees: ['', [Validators.required, Validators.minLength(1)]],
      dateDebutApprentissage: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.sectionVisibility['section1'] = false;
    this.sectionVisibility['section2'] = false;
    this.sectionVisibility['section3'] = false;
    this.sectionVisibility['section4'] = false;
    this.sectionVisibility['section5'] = false;
    this.sectionValidationStates['section1'] = false;
    this.sectionValidationStates['section2'] = false;
    this.sectionValidationStates['section3'] = false;
    this.sectionValidationStates['section4'] = false;
    this.sectionValidationStates['section5'] = false;

    this.dossierForm.markAllAsTouched();
    this.individualInfoForm.markAllAsTouched();
    this.addressForm.markAllAsTouched();
    this.assignmentForm.markAllAsTouched();
    this.careerForm.markAllAsTouched();
  }

  toggleForm(sectionId: string): void {
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
  }

  onSubmit(sectionId: string): void {
    let form: FormGroup;
    if (sectionId === 'section1') form = this.dossierForm;
    else if (sectionId === 'section2') form = this.individualInfoForm;
    else if (sectionId === 'section3') form = this.addressForm;
    else if (sectionId === 'section4') form = this.assignmentForm;
    else if (sectionId === 'section5') form = this.careerForm;
    else return;

    if (form.valid) {
      this.sectionValidationStates[sectionId] = true;
      console.log(`Formulaire ${sectionId} soumis avec succès :`, form.value);

      if (sectionId === 'section1') {
        this.sectionVisibility['section1'] = false;
        this.showAdditionalSections = true;
        this.activeProgressButton = 'En Cours'; // Passer à "En Cours" quand section1 est validée
        setTimeout(() => this.section2AnimationState = 'visible', 300);
        setTimeout(() => this.section3AnimationState = 'visible', 600);
        setTimeout(() => this.section4AnimationState = 'visible', 900);
        setTimeout(() => this.section5AnimationState = 'visible', 1200);
      }

      this.sectionVisibility[sectionId] = false;
    } else {
      this.sectionValidationStates[sectionId] = false;
      console.log(`Formulaire ${sectionId} invalide`);
    }
  }
}
