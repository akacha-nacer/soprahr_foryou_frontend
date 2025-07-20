import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {telephoneTypeData} from '../popup-type-telephone/popup-type-telephone.component';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';

export interface AdressTypeData {
  code: string;
  libelle: string;
}
@Component({
  selector: 'app-popup-type-adresse',
  imports: [
    FormsModule,
    MatIconButton,
    NgForOf
  ],
  standalone:true,
  templateUrl: './popup-type-adresse.component.html',
  styleUrl: './popup-type-adresse.component.css'
})
export class PopupTypeAdresseComponent {


  searchTerm: string = '';
  filteredRows: AdressTypeData[] = [];
  selectedRow: AdressTypeData | null = null;

  rows: AdressTypeData[] = [
    { code: 'BIL',  libelle: 'Billing' },
    { code: 'BSN',  libelle: 'Adresse professionnelle' },
    { code: 'DET',  libelle: 'Adresse de détachement' },
    { code: 'DOM',  libelle: 'Résidence' },
    { code: 'HOM',  libelle: 'Adresse domicile' },
    { code: 'IND',  libelle: 'Adresse travailleur indépendant' },
    { code: 'ONS',  libelle: 'Onsite' },
    { code: 'OTH',  libelle: 'Other' },
    { code: 'PER',  libelle: 'Permanent' },
    { code: 'RES',  libelle: 'Adresse de résidence' },
    { code: 'SUM',  libelle: 'Adresse résidence secondaire' }
  ];


  constructor(
    public dialogRef: MatDialogRef<PopupTypeAdresseComponent>,
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
        row.code.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  selectRow(row: AdressTypeData): void {
    this.selectedRow = row;
  }
  onClose(): void {
    this.dialogRef.close(false);
  }

  onYes(): void {
    if (this.selectedRow) {
      this.dialogRef.close(this.selectedRow);
    } else {
      alert('Veuillez sélectionner un type de contact ');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
