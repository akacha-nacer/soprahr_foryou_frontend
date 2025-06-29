// embauche.component.ts
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule} from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {EmbaucheService} from '../services/embauche.service';
import { DossierModel, RenseignementsIndividuels, Adresses, Affectations, Carriere, Nationalite } from '../models/DossierModel';
import { HttpClientModule } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {PopupConfMaladieComponent} from '../popup-conf-maladie/popup-conf-maladie.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-embauche',
  templateUrl: './embauche.component.html',
  styleUrls: ['./embauche.component.css'],
  standalone: true,
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule
  ],
  animations: [
    trigger('slideDown', [
      state('hidden', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('visible', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      transition('hidden <=> visible', [animate('300ms ease-in-out')])
    ]),
    trigger('slideHeader', [
      state('hidden', style({ transform: 'translateY(-100%)', opacity: 0, height: '0px', overflow: 'hidden' })),
      state('visible', style({ transform: 'translateY(0)', opacity: 1, height: '*', overflow: 'hidden' })),
      transition('hidden => visible', [animate('300ms ease-in-out')])
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
  activeProgressButton: string = 'Créer';

  // Model to store all form data
  dossierData: DossierModel = {
    dateRecrutement: '',
    codeSociete: '',
    etablissement: '',
    matriculeSalarie: '',
    renseignementsIndividuels: {
      qualite: '',
      nomUsuel: '',
      nomPatronymique: '',
      prenom: '',
      deuxiemePrenom: '',
      sexe: '',
      numeroInsee: '',
      dateNaissance: '',
      villeNaissance: '',
      departementNaissance: '',
      paysNaissance: '',
      nationalites: [],
      etatFamilial: '',
      dateEffet: ''
    },
    adresses: [],
    affectations: [],
    carriere: []
  };

  // List of countries for the dropdown
  countries: string[] = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
    'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
    'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
    'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
    'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
    'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
    'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
    'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
    'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
    'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  constructor(private fb: FormBuilder, private dossierService: EmbaucheService,private dialog: MatDialog) {
    this.dossierForm = this.fb.group({
      dateRecrutement: ['', [Validators.required]],
      codeSociete: ['', [Validators.required]],
      etablissement: ['', [Validators.required]],
      matriculeSalarie: ['', [Validators.required]]
    });

    this.individualInfoForm = this.fb.group({
      qualite: ['', [Validators.required]],
      nomUsuel: ['', [Validators.required]],
      nomPatronymique: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      deuxiemePrenom: ['', [Validators.required]],
      sexe: ['', [Validators.required]],
      numeroInsee: ['', [Validators.required]],
      dateNaissance: ['', [Validators.required]],
      villeNaissance: ['', [Validators.required]],
      departementNaissance: ['', [Validators.required]],
      paysNaissance: ['', [Validators.required]],
      nationalites: this.fb.array([this.createNationality()]),
      etatFamilial: ['', [Validators.required]],
      dateEffet: ['', [Validators.required]]
    });

    this.addressForm = this.fb.group({
      pays: ['', [Validators.required]],
      typeAdresse: ['', [Validators.required]],
      adressePrincipale: ['', [Validators.required]],
      valableDu: ['', [Validators.required]],
      valableAu: ['', [Validators.required]],
      numeroVoie: ['', [Validators.required]],
      natureVoie: ['', [Validators.required]],
      complement1: ['', [Validators.required]],
      complement2: ['', [Validators.required]],
      lieuDit: ['', [Validators.required]],
      codePostal: ['', [Validators.required]],
      commune: ['', [Validators.required]],
      codeInseeCommune: ['', [Validators.required]]
    });

    this.assignmentForm = this.fb.group({
      categorieEntree: ['', [Validators.required]],
      motifEntree: ['', [Validators.required]],
      poste: ['', [Validators.required]],
      emploi: ['', [Validators.required]],
      uniteOrganisationnelle: ['', [Validators.required]],
      calendrierPaie: ['', [Validators.required]],
      codeCycle: ['', [Validators.required]],
      indexe: ['', [Validators.required]],
      modaliteGestion: ['', [Validators.required]]
    });

    this.careerForm = this.fb.group({
      conventionCollective: ['', [Validators.required]],
      accordEntreprise: ['', [Validators.required]],
      qualification: ['', [Validators.required]],
      typePaie: ['', [Validators.required]],
      regimeSpecial: ['', [Validators.required]],
      natureContrat: ['', [Validators.required]],
      typeContrat: ['', [Validators.required]],
      duree: ['', [Validators.required]],
      dateFinPrevue: ['', [Validators.required]],
      dateDebutEssai: ['', [Validators.required]],
      dateFinEssai: ['', [Validators.required]],
      typeTemps: ['', [Validators.required]],
      modaliteHoraire: ['', [Validators.required]],
      forfaitJours: ['', [Validators.required]],
      forfaitHeures: ['', [Validators.required, Validators.min(0)]],
      surcotisation: ['', [Validators.required]],
      heuresTravaillees: ['', [Validators.required]],
      heuresPayees: ['', [Validators.required]],
      dateDebutApprentissage: ['', [Validators.required]]
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
  }

  get nationalites(): FormArray {
    return this.individualInfoForm.get('nationalites') as FormArray;
  }

  createNationality(): FormGroup {
    return this.fb.group({
      pays: ['', [Validators.required]],
      natPrincipale: [false]
    });
  }

  addNationality(): void {
    this.nationalites.push(this.createNationality());
  }

  removeNationality(index: number): void {
    if (this.nationalites.length > 1) {
      this.nationalites.removeAt(index);
    }
  }

  onPrincipalChange(index: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      // Uncheck all other nationalities
      this.nationalites.controls.forEach((control, i) => {
        if (i !== index) {
          control.get('natPrincipale')?.setValue(false);
        }
      });
    }
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
      this.updateDossierData(sectionId, form.value);

      if (sectionId === 'section1') {
        this.sectionVisibility['section1'] = false;
        this.showAdditionalSections = true;
        this.activeProgressButton = 'En Cours';
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

  updateDossierData(sectionId: string, formValue: any): void {
    switch (sectionId) {
      case 'section1':
        this.dossierData.dateRecrutement = formValue.dateRecrutement;
        this.dossierData.codeSociete = formValue.codeSociete;
        this.dossierData.etablissement = formValue.etablissement;
        this.dossierData.matriculeSalarie = formValue.matriculeSalarie;
        break;
      case 'section2':
        this.dossierData.renseignementsIndividuels = { ...this.dossierData.renseignementsIndividuels, ...formValue };
        break;
      case 'section3':
        const address: Adresses = { ...formValue };
        this.dossierData.adresses.push(address);
        break;
      case 'section4':
        const affectation: Affectations = { ...formValue };
        this.dossierData.affectations.push(affectation);
        break;
      case 'section5':
        const carriere: Carriere = { ...formValue };
        this.dossierData.carriere.push(carriere);
        break;
    }
  }

  onFinalSubmit(): void {

    const dialogRef = this.dialog.open(PopupConfMaladieComponent, {
      width: '700px',
      data: { message: "Voulez-vous valider définitivement toutes les informations du dossier d'embauche ?" }
    });

    if (this.areAllSectionsValid()) {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.dossierService.saveDossier(this.dossierData).subscribe({
            next: (response) => {
              console.log('Dossier saved:', response);
              alert('Dossier soumis avec succès!');
              this.resetForms();
            },
            error: (error) => {
              console.error('Error saving dossier:', error);
              alert('Erreur lors de la soumission du dossier.');
            }
          });
        }
      });
    } else {
      alert('Veuillez valider toutes les sections avant de soumettre.');
    }
  }

  areAllSectionsValid(): boolean {
    return Object.values(this.sectionValidationStates).every(state => state);
  }

  resetForms(): void {
    this.dossierForm.reset();
    this.individualInfoForm.reset();
    this.addressForm.reset();
    this.assignmentForm.reset();
    this.careerForm.reset();
    this.showAdditionalSections = false;
    this.sectionValidationStates = {
      'section1': false,
      'section2': false,
      'section3': false,
      'section4': false,
      'section5': false
    };
    this.dossierData = {
      dateRecrutement: '',
      codeSociete: '',
      etablissement: '',
      matriculeSalarie: '',
      renseignementsIndividuels: {
        qualite: '',
        nomUsuel: '',
        nomPatronymique: '',
        prenom: '',
        deuxiemePrenom: '',
        sexe: '',
        numeroInsee: '',
        dateNaissance: '',
        villeNaissance: '',
        departementNaissance: '',
        paysNaissance: '',
        nationalites: [this.createNationality().value as Nationalite],
        etatFamilial: '',
        dateEffet: ''
      },
      adresses: [],
      affectations: [],
      carriere: []
    };
    this.activeProgressButton = 'Créer';
  }
}
