import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {PopupNatureHeureComponent} from '../popup-nature-heure/popup-nature-heure.component';

@Component({
  selector: 'app-journee',
  imports: [CommonModule],
  templateUrl: './journee.component.html',
  styleUrl: './journee.component.css',
  standalone: true,
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
export class JourneeComponent implements OnInit{
  natureHeuresForm: FormGroup;
  sectionVisibility: { [key: string]: boolean } = {};
  sectionValidationStates: { [key: string]: boolean } = {};
  activeProgressButton: string = 'Créer';
  natureHeuresData = [
    { nature: 'Absence à tort', debut: '09:00', fin: '13:00', duree: '4h00', saisie: '' }
  ];

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.natureHeuresForm = this.fb.group({
      date: ['', [Validators.required]],
      nature: ['', [Validators.required]],
      de: ['', [Validators.required]],
      a: ['', [Validators.required]],
      duree: [{ value: '', disabled: true }],
      commentaire1: [''],
      commentaire2: ['']
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

    this.natureHeuresForm.markAllAsTouched();
  }

  toggleForm(sectionId: string): void {
    this.sectionVisibility[sectionId] = !this.sectionVisibility[sectionId];
  }

  onSubmit(sectionId: string): void {
    if (sectionId === 'section3' && this.natureHeuresForm.valid) {
      this.sectionValidationStates[sectionId] = true;
      console.log(`Formulaire ${sectionId} soumis avec succès :`, this.natureHeuresForm.value);
      this.sectionVisibility[sectionId] = false;
    } else {
      this.sectionValidationStates[sectionId] = false;
      console.log(`Formulaire ${sectionId} invalide`);
    }
  }

  openAddNatureHeure(): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      width: '700px',
      data: { type: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nature d\'heure ajoutée :', result);
      }
    });
  }

  openDetail(item: any): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      width: '700px',
      data: { type: 'detail', item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Détail affiché :', result);
      }
    });
  }

  openEdit(item: any): void {
    const dialogRef = this.dialog.open(PopupNatureHeureComponent, {
      width: '700px',
      data: { type: 'edit', item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Modification enregistrée :', result);
      }
    });
  }

  deleteItem(item: any): void {
    console.log('Suppression de :', item);
    // Logique de suppression (à implémenter avec le backend plus tard)
  }
}
