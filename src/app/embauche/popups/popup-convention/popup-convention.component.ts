import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';

export interface AdressTypeData {
  code: string;
  libelle: string;
}

@Component({
  selector: 'app-popup-convention',
  imports: [
    FormsModule,
    MatIconButton,
    NgForOf
  ],
  standalone:true,
  templateUrl: './popup-convention.component.html',
  styleUrl: './popup-convention.component.css'
})
export class PopupConventionComponent implements OnInit{

  searchTerm: string = '';
  filteredRows: AdressTypeData[] = [];
  selectedRow: AdressTypeData | null = null;

  rows: AdressTypeData[] = [
    { code: '2344',  libelle: 'Convention collective de la sidérurgie' },
    { code: '3025',  libelle: 'Ingénieurs et cadres de la métallurgie' },
    { code: '3109',  libelle: 'métallurgie - Accord nationaux' },
    { code: '3126',  libelle: 'métallurgie - Région parisienne' },
    { code: '9999',  libelle: 'Sans convention collective' },
    { code: 'CSTFT',  libelle: 'Convention collective CST FT ' }
  ];


  constructor(
    public dialogRef: MatDialogRef<PopupConventionComponent>,
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
