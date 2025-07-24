// embauche.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {EmbaucheService} from '../services/embauche.service';
import { DossierModel, RenseignementsIndividuels, Adresses, Affectations, Carriere, Nationalite } from '../models/DossierModel';
import { HttpClientModule } from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {PopupConfMaladieComponent} from '../popup-conf-maladie/popup-conf-maladie.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {PopupNatureHeureComponent} from '../popup-nature-heure/popup-nature-heure.component';
import {PopupEtablissementComponent} from './popups/popup-etablissement/popup-etablissement.component';
import {PopupDepartementNaissComponent} from './popups/popup-departement-naiss/popup-departement-naiss.component';
import {PopupTypeTelephoneComponent} from './popups/popup-type-telephone/popup-type-telephone.component';
import {PopupTypeAdresseComponent} from './popups/popup-type-adresse/popup-type-adresse.component';
import {PopupMotifEntreeComponent} from './popups/popup-motif-entree/popup-motif-entree.component';
import {PopupConventionComponent} from './popups/popup-convention/popup-convention.component';
import {PopupQualifComponent} from './popups/popup-qualif/popup-qualif.component';
import {PopupNatureContratComponent} from './popups/popup-nature-contrat/popup-nature-contrat.component';

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
  departId: string = '';
  viewMode: 'form' | 'historique' = 'form'; // Added for view switching
  allDossiers: DossierModel[] = []; // Added for historical data
  allRenseignements: any[] = []; // Added for processed individual info
  allAdresses: any[] = []; // Added for processed addresses
  allAffectations: any[] = []; // Added for processed assignments
  allCarrieres: any[] = []; // Added for processed careers
  selectedMatricule: string | null = null;

  tableVisibility: { [key: string]: boolean } = {
    'historique-dossiers': true,
    'historique-renseignements': false,
    'historique-adresses': false,
    'historique-affectations': false,
    'historique-carrieres': false,
  };

  dossierData: DossierModel = {
    dateRecrutement: '',
    codeSociete: '',
    etablissement: '',
    matriculeSalarie: '',
    dateCreation: '',
    departementId: '',
    departementLibelle: '',
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
      paysNaissance: '',
      nationalites: [],
      etatFamilial: '',
      dateEffet: ''
    },
    adresses: [],
    affectations: [],
    carriere: []
  };

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

  private namePattern = /^[a-zA-ZÀ-ÿ\s-]+$/;

  // Custom validator for dates not in the future
  notFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate > today ? { futureDate: true } : null;
    };
  }

  // Custom validator for dates in the future
  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate <= today ? { pastDate: true } : null;
    };
  }

  dateRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const start = group.get(startControlName)?.value;
      const end = group.get(endControlName)?.value;
      if (start && end && new Date(start) >= new Date(end)) {
        return { invalidDateRange: true };
      }
      return null;
    };
  }

  constructor(private fb: FormBuilder, private dossierService: EmbaucheService, private dialog: MatDialog) {
    this.dossierForm = this.fb.group({
      dateRecrutement: ['', [Validators.required, this.notFutureDateValidator()]],
      codeSociete: ['', [Validators.required]],
      etablissement: ['', [Validators.required]],
      matriculeSalarie: ['', [Validators.required]]
    });

    this.individualInfoForm = this.fb.group({
      qualite: ['', [Validators.required]],
      nomUsuel: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      nomPatronymique: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      prenom: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      deuxiemePrenom: ['', [ Validators.pattern(this.namePattern)]],
      sexe: ['', [Validators.required]],
      numeroInsee: ['', [Validators.required]],
      dateNaissance: ['', [Validators.required, this.notFutureDateValidator()]],
      villeNaissance: ['', [Validators.required, Validators.pattern(this.namePattern)]],
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
      numeroVoie: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      natureVoie: ['', [Validators.required]],
      complement1: ['', [Validators.required]],
      complement2: ['', [Validators.required]],
      lieuDit: ['', [Validators.required]],
      codePostal: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      commune: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      codeInseeCommune: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator('valableDu', 'valableAu') });

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
      dateFinPrevue: ['', [Validators.required, this.futureDateValidator()]],
      dateDebutEssai: ['', [Validators.required]],
      dateFinEssai: ['', [Validators.required]],
      typeTemps: ['', [Validators.required]],
      modaliteHoraire: ['', [Validators.required]],
      forfaitJours: ['', [Validators.required, Validators.min(0)]],
      forfaitHeures: ['', [Validators.required, Validators.min(0)]],
      surcotisation: ['', [Validators.required]],
      heuresTravaillees: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      heuresPayees: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      dateDebutApprentissage: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator('dateDebutEssai', 'dateFinEssai') });
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
        this.dossierData.departementId = this.departId;
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
      dateCreation: '',
      departementId: '',
      departementLibelle: '',
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

  openetablissementpopup(): void {
    const dialogRef = this.dialog.open(PopupEtablissementComponent, {
      width: '700px',
      maxWidth: '700px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez un établissement"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Etablissement sélectionné :', result);
        this.dossierForm.patchValue({
          etablissement: result.libelle
        });
      }
    });
  }

  opendepartementpopup(): void {
    const dialogRef = this.dialog.open(PopupDepartementNaissComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez un département"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Département sélectionné (ID) :', result);
        this.departId = result;
        this.dossierService.RetrieveDepartementNaiss().subscribe(depts => {
          const selectedDept = depts.find(d => d.id === result);
          if (selectedDept) {
            this.individualInfoForm.patchValue({
              departementNaissance: selectedDept.libelle
            });
          }
        });
      } else {
        console.log('Aucun département sélectionné');
      }
    });
  }

  openTelephonepopup(): void {
    const dialogRef = this.dialog.open(PopupTypeTelephoneComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez un type de voie"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addressForm.patchValue({
          natureVoie: result.libelle
        });
      }
    });
  }

  openTypeAdressepopup(): void {
    const dialogRef = this.dialog.open(PopupTypeAdresseComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez un type d'adresses"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addressForm.patchValue({
          typeAdresse: result.code
        });
      }
    });
  }

  openMotifpopup(): void {
    const dialogRef = this.dialog.open(PopupMotifEntreeComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez un Motif d'entrée"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assignmentForm.patchValue({
          motifEntree: result
        });
      }
    });
  }

  openConventionpopup(): void {
    const dialogRef = this.dialog.open(PopupConventionComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez une convention"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.careerForm.patchValue({
          conventionCollective: result.code
        });
      }
    });
  }

  openQualifpopup(): void {
    const dialogRef = this.dialog.open(PopupQualifComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez une qualification"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.careerForm.patchValue({
          qualification: result
        });
      }
    });
  }

  openNatureContratpopup(): void {
    const dialogRef = this.dialog.open(PopupNatureContratComponent, {
      width: '700px',
      maxWidth: '900px',
      minWidth: '600px',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      data: {
        message: "Sélectionnez une nature de contrat"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.careerForm.patchValue({
          natureContrat: result
        });
      }
    });
  }

  // Added method to toggle view mode
  toggleViewMode(mode: 'form' | 'historique'): void {
    this.viewMode = mode;
    this.activeProgressButton = mode === 'form' ? 'Créer' : 'Historique';
    if (mode === 'historique') {
      this.fetchHistoriqueData();
    }
  }

  // Added method to fetch historical data
  private fetchHistoriqueData(): void {
    this.dossierService.getAllDossiers().subscribe({
      next: (dossiers) => {
        console.log('Dossiers received:', dossiers);
        this.allDossiers = dossiers;
        this.processDossiers();
      },
      error: (error) => {
        console.error('Error fetching dossiers:', error);
      },
    });
  }

  selectDossier(matricule: string): void {
    this.selectedMatricule = matricule;
  }

  clearSelection(): void {
    this.selectedMatricule = null;
  }

  private processDossiers(): void {
    this.allRenseignements = this.allDossiers.map(dossier => {
      const rens = dossier.renseignementsIndividuels;
      return {
        matriculeSalarie: dossier.matriculeSalarie,
        ...(rens || {}),
        departementNaissance: dossier.departementLibelle,
        nationalites: rens && rens.nationalites ? rens.nationalites.map(n => n.pays).join(', ') : '',
      };
    });

    this.allAdresses = this.allDossiers.flatMap(dossier =>
      (dossier.adresses || []).map(adresse => ({
        matriculeSalarie: dossier.matriculeSalarie,
        ...adresse,
      }))
    );

    this.allAffectations = this.allDossiers.flatMap(dossier =>
      (dossier.affectations || []).map(affectation => ({
        matriculeSalarie: dossier.matriculeSalarie,
        ...affectation,
      }))
    );

    this.allCarrieres = this.allDossiers.flatMap(dossier =>
      (dossier.carriere || []).map(carriere => ({
        matriculeSalarie: dossier.matriculeSalarie,
        ...carriere,
      }))
    );
  }

  toggleTable(section: string): void {
    this.tableVisibility[section] = !this.tableVisibility[section];
  }
}
