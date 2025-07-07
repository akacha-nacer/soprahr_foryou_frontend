import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

export interface EtablissementData {
  modele: string;
  etablissement: string;
  libelle: string;
}
@Component({
  selector: 'app-popup-etablissement',
  standalone : true,
  imports: [
    MatIconButton,
    FormsModule,
    NgForOf
  ],
  templateUrl: './popup-etablissement.component.html',
  styleUrl: './popup-etablissement.component.css'
})
export class PopupEtablissementComponent implements OnInit{

  searchTerm: string = '';
  filteredRows: EtablissementData[] = [];
  selectedRow: EtablissementData | null = null;

  rows: EtablissementData[] = [
    { modele: 'FRO', etablissement: 'etablissement TT', libelle: 'ETABTLWK' },
    { modele: 'FRO', etablissement: 'ETABWT', libelle: 'ETABWT' },
    { modele: 'FRO', etablissement: 'ETBSMGTA', libelle: 'ETBSMGTA' },
    { modele: 'FRO', etablissement: 'ETDSLMOK', libelle: 'ETDSLMOK' },
    { modele: 'FRO', etablissement: 'Etab.F.Pr.Rg -11 s', libelle: 'FR1RG' },
    { modele: 'FRO', etablissement: 'Tour GAMMA', libelle: 'FRPGAMMA' },
    { modele: 'FRO', etablissement: 'Siège social', libelle: 'FRPSIEGE' },
    { modele: 'FRO', etablissement: 'Etablissement FRS', libelle: 'FRSGAMMA' },
    { modele: 'FRO', etablissement: 'Siège social', libelle: 'FRSSIEGE' },
    { modele: 'FRO', etablissement: 'GAMMA', libelle: 'FRYSGAMMA' },
    { modele: 'FRO', etablissement: 'PWB.dev + 20 sal.', libelle: 'PW1GAMMA' },
    { modele: 'FRO', etablissement: 'PWB siège + 20 sal.', libelle: 'PW1SIEGE' },
    { modele: 'FRO', etablissement: 'PW2 siège -20 sal.', libelle: 'PW2SIEGE' },
    { modele: 'FRO', etablissement: 'PW2 GAMMA -20 sal.', libelle: 'PW2GAMMA' },
    { modele: 'FRO', etablissement: 'PW2 siège -20 sal.', libelle: 'SIEGE' },
  ];


  constructor(
    public dialogRef: MatDialogRef<PopupEtablissementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {

    this.filteredRows = [...this.rows];
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRows = [...this.rows];
    } else {
      this.filteredRows = this.rows.filter(row =>
        row.libelle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        row.etablissement.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectRow(row: EtablissementData): void {
    this.selectedRow = row;
  }
  onClose(): void {
    this.dialogRef.close(false);
  }

  onYes(): void {
    if (this.selectedRow) {
      this.dialogRef.close(this.selectedRow);
    } else {
      alert('Veuillez sélectionner un établissement');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
