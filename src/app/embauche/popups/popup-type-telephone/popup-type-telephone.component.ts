import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EtablissementData} from '../popup-etablissement/popup-etablissement.component';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';

export interface telephoneTypeData {
  code: string;
  libelle: string;
}
@Component({
  selector: 'app-popup-type-telephone',
  imports: [
    FormsModule,
    MatIconButton,
    NgForOf,

  ],
  standalone : true,
  templateUrl: './popup-type-telephone.component.html',
  styleUrl: './popup-type-telephone.component.css'
})
export class PopupTypeTelephoneComponent implements OnInit {


  searchTerm: string = '';
  filteredRows: telephoneTypeData[] = [];
  selectedRow: telephoneTypeData | null = null;

  rows: telephoneTypeData[] = [
    { code: 'CEL',  libelle: 'Mobile' },
    { code: 'CPC',  libelle: 'Mobile professionnel' },
    { code: 'CPP',  libelle: 'Mobile personnel' },
    { code: 'FAX',  libelle: 'Télécopie' },
    { code: 'HPN',  libelle: 'Fixe personnel' },
    { code: 'NET',  libelle: 'Adresse internet' },
    { code: 'PPP',  libelle: 'Fixe' },
    { code: 'PRF',  libelle: 'Mon numéro préféré' },
    { code: 'TPN',  libelle: 'Téléphone en détachement' },
    { code: 'WPN',  libelle: 'Fixe professionnel' }
  ];


  constructor(
    public dialogRef: MatDialogRef<PopupTypeTelephoneComponent>,
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

  selectRow(row: telephoneTypeData): void {
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
