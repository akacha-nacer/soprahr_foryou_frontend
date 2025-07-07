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
  itemsPerPage: number = 10; // Number of items per page
  totalPages: number = 1;


  constructor(
    public dialogRef: MatDialogRef<PopupDepartementNaissComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private cdr: ChangeDetectorRef,
    public embaucheService: EmbaucheService
  ) {

  }

  ngOnInit(): void {
    this.embaucheService.RetrieveDepartementNaiss().subscribe(
      (value: DepartementNaiss[]) => {
        this.departements = value;
        console.log('Fetched departements:', this.departements);
        this.filterItems();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching departements:', error);
      }
    );
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDepartments = [...this.departements];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredDepartments = this.departements.filter(dept =>
        dept.code.toLowerCase().includes(searchLower) ||
        dept.libelle.toLowerCase().includes(searchLower) ||
        dept.status.toLowerCase().includes(searchLower)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  // Get paginated slice of filteredDepartments
  get paginatedDepartments(): DepartementNaiss[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDepartments.slice(startIndex, endIndex);
  }

  // Update total pages and generate page numbers
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDepartments.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
  }

  // Generate array of page numbers for display
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Navigate to a specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
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
      alert('Veuillez sélectionner un établissement');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
