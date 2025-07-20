import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EtablissementData} from '../popup-etablissement/popup-etablissement.component';
import {MatIconButton} from '@angular/material/button';
import {CommonModule, NgForOf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DepartementNaiss} from '../../../models/DepartementNaiss';
import {EmbaucheService} from '../../../services/embauche.service';

@Component({
  selector: 'app-popup-departement-naiss',
  imports: [
    MatIconButton,
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  standalone : true,
  templateUrl: './popup-departement-naiss.component.html',
  styleUrl: './popup-departement-naiss.component.css'
})
export class PopupDepartementNaissComponent implements OnInit {

  searchTerm: string = '';
  departements: DepartementNaiss[] = [];
  filteredDepartments: DepartementNaiss[] = [];
  selectedRow: DepartementNaiss | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    public dialogRef: MatDialogRef<PopupDepartementNaissComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private cdr: ChangeDetectorRef,
    public embaucheService: EmbaucheService
  ) {}

  ngOnInit(): void {
    this.embaucheService.RetrieveDepartementNaiss().subscribe(
      (value: DepartementNaiss[]) => {
        this.departements = value || []; // Default to empty array if null
        console.log('Fetched departements:', this.departements);
        this.filterItems(); // Initialize filtered list
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error fetching departements:', error);
        this.departements = []; // Set to empty array on error
        this.filterItems();
        this.cdr.markForCheck();
      }
    );
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDepartments = [...this.departements];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredDepartments = this.departements.filter(dept => {
        const code = dept.code || '';
        const libelle = dept.libelle || '';
        const status = dept.status || '';
        return (
          code.toLowerCase().includes(searchLower) ||
          libelle.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower)
        );
      });
    }
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.markForCheck();
  }

  get paginatedDepartments(): DepartementNaiss[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDepartments.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDepartments.length / this.itemsPerPage);
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
      this.cdr.markForCheck();
    }
  }

  selectRow(row: DepartementNaiss): void {
    this.selectedRow = row;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onYes(): void {
    if (this.selectedRow) {
      this.dialogRef.close(this.selectedRow.id);
    } else {
      alert('Veuillez sélectionner un département');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
