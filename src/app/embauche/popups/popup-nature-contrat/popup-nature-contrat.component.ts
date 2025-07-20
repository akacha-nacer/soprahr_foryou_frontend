import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatIconButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

export interface MotifData {
  code: string;
  libelle: string;
}
@Component({
  selector: 'app-popup-nature-contrat',
  imports: [
    MatIconButton,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ],
  standalone:true,
  templateUrl: './popup-nature-contrat.component.html',
  styleUrl: './popup-nature-contrat.component.css'
})
export class PopupNatureContratComponent implements OnInit{

  searchTerm: string = '';
  Motifs: MotifData[] = [];
  filteredMotifs: MotifData[] = [];
  selectedRow: MotifData | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  rows: MotifData[] = [
    { code: '00', libelle: 'CDI classique' },
    { code: 'AC', libelle: 'Unique insertion - Accompagnement emploi' },
    { code: 'AD', libelle: 'Contrat adaptation' },
    { code: 'AE', libelle: 'Contrat d\'accès emploi département Outre-Mer' },
    { code: 'AR', libelle: 'Artiste' },
    { code: 'CA', libelle: 'Contrat d\'apprentissage loi 1987' },
    { code: 'CB', libelle: 'Contrat d\'apprentissage loi 1979' },
    { code: 'CI', libelle: 'Contrat de travail intermittent' },
    { code: 'CS', libelle: 'CDD pour les seniors' },
    { code: 'DE', libelle: 'Détaché à l\'étranger' },
    { code: 'DO', libelle: 'Contrat de travail à domicile' },
    { code: 'DS', libelle: 'contrat à durée déterminée senior' },
    { code: 'EA', libelle: 'Emploi d\'avenir CAF' },
    { code: 'EI', libelle: 'Emploi d\'avenir CEI' },
    { code: 'EJ', libelle: 'CONTRAT EMPLOI JEUNE' },
    { code: 'EM', libelle: 'Mise à disposition (Groupement d\'employeurs)' },
    { code: 'EO', libelle: 'Contrat d\'orientation' },
    { code: 'ES', libelle: 'A l\'essai' },
    { code: 'EV', libelle: 'CONTRAT EMPLOI DE VILLE' },
    { code: 'EX', libelle: 'Contrat de travail international (expatrié)' },
    { code: 'FO', libelle: 'Formateur occasionnel' },
    { code: 'FR', libelle: 'Frontalier' },
    { code: 'IE', libelle: 'Unique insertion - initiative emploi' },
    { code: 'IM', libelle: 'Impatrié' },
    { code: 'JO', libelle: 'Journaliste' },
    { code: 'MA', libelle: 'Mannequin' },
    { code: 'OD', libelle: 'CDD à objet défini' },
    { code: 'OR', libelle: 'Contrat d\'orientation' },
    { code: 'P1', libelle: 'Contrat de professionnalisation diplôme < IV' }
  ];

  constructor(
    public dialogRef: MatDialogRef<PopupNatureContratComponent>,
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
      alert('Veuillez sélectionner une nature de contrat');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
