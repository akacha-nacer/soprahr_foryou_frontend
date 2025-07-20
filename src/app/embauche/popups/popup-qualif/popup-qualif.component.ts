import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatIconButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

interface MotifData {
  code: string;
  libelle: string;
  classif: string;
  libClassif: string;
}
@Component({
  selector: 'app-popup-qualif',
  imports: [
    MatIconButton,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ],
  standalone:true,
  templateUrl: './popup-qualif.component.html',
  styleUrl: './popup-qualif.component.css'
})
export class PopupQualifComponent {


  searchTerm: string = '';
  Motifs: MotifData[] = [];
  filteredMotifs: MotifData[] = [];
  selectedRow: MotifData | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  rows: MotifData[] = [
    { code: 'ADM', libelle: 'Agent administrat.', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'AM1', libelle: 'AM hors at. 48bis', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'AM2', libelle: 'AM hors at. art.36', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'AMA', libelle: 'AM hors atelier', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'AMT', libelle: 'AM atelier', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'AP1', libelle: 'Apprenti cadre', classif: 'CAD', libClassif: 'Cadres' },
    { code: 'AP2', libelle: 'Apprenti non cadre', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'ASE', libelle: 'Ouvrier spécialisé', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'ATA', libelle: 'Tech. atelier (TA)', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'ATE', libelle: 'Agent technique', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'CAA', libelle: 'Cadre A', classif: 'CAD', libClassif: 'Cadres' },
    { code: 'CAB', libelle: 'Cadre B', classif: 'CAD', libClassif: 'Cadres' },
    { code: 'CAS', libelle: 'Cadre supérieur', classif: 'CAD', libClassif: 'Cadres' },
    { code: 'CH', libelle: 'Intérimaire', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'DIR', libelle: 'Dirigeant', classif: 'DMS', libClassif: 'Dirigeant et Mand.' },
    { code: 'ENQ', libelle: 'Empl. non qualifié', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'EQU', libelle: 'Employé qualifié', classif: 'ETA', libClassif: 'ETAM' },
    { code: 'ONQ', libelle: 'Ouvr. non qualifié', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'OQU', libelle: 'Ouvrier qualifié', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'OUE', libelle: 'Ouvrier expert', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'SAI', libelle: 'Saisonnier', classif: 'OUV', libClassif: 'Ouvriers' },
    { code: 'SKW', libelle: 'skilled-worker', classif: 'OUV', libClassif: 'Ouvriers' }
  ];

  constructor(
    public dialogRef: MatDialogRef<PopupQualifComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.Motifs = [...this.rows];
    this.filterItems();
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMotifs = [...this.Motifs];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredMotifs = this.Motifs.filter(dept =>
        dept.code.toLowerCase().includes(searchLower) ||
        dept.libelle.toLowerCase().includes(searchLower)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  get paginatedDepartments(): MotifData[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMotifs.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMotifs.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  selectRow(row: MotifData): void {
    this.selectedRow = row;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onYes(): void {
    if (this.selectedRow) {
      this.dialogRef.close(this.selectedRow.code);
    } else {
      alert('Veuillez sélectionner une qualification');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
