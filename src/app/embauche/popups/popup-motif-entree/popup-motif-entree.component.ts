import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {DepartementNaiss} from '../../../models/DepartementNaiss';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EmbaucheService} from '../../../services/embauche.service';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {NgForOf, NgIf} from '@angular/common';

export interface MotifData {
  code: string;
  libelle: string;
}
@Component({
  selector: 'app-popup-motif-entree',
  imports: [
    FormsModule,
    MatIconButton,
    NgForOf,
    NgIf
  ],
  standalone:true,
  templateUrl: './popup-motif-entree.component.html',
  styleUrl: './popup-motif-entree.component.css'
})
export class PopupMotifEntreeComponent implements OnInit{

  searchTerm: string = '';
  Motifs: MotifData[] = [];
  filteredMotifs: MotifData[] = [];
  selectedRow: MotifData | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  rows: MotifData[] = [
    { code: '99', libelle: 'Période d’essai standard de 3 jours' },
    { code: 'APP', libelle: 'Fin de contrat apprentissage' },
    { code: 'AUT', libelle: 'Autre' },
    { code: 'AUTR', libelle: 'Autre fin de contrat pour motif économique' },
    { code: 'BATEMP', libelle: 'Baja temporal' },
    { code: 'BDP', libelle: 'Baja por despido disciplinario procedente' },
    { code: 'CAC', libelle: 'Congé d’accueil' },
    { code: 'CAP', libelle: 'Congé parental Temps Plein' },
    { code: 'CDD', libelle: 'Fin de CDD ou fin d’accueil occasionnel' },
    { code: 'CFA', libelle: 'Congé fin d’activité' },
    { code: 'CFOR', libelle: 'Congé formation' },
    { code: 'CHOTOT', libelle: 'Chômage total sans rupture de contrat de trav' },
    { code: 'CNF', libelle: 'Prise en charge par le CNFPT' },
    { code: 'CNR', libelle: 'Congé sans solde' },
    { code: 'CPA', libelle: 'Congé parental' },
    { code: 'CRE', libelle: 'Création' },
    { code: 'CRP', libelle: 'Convention de reclassement personnalisé' },
    { code: 'DEC', libelle: 'Décès' },
    { code: 'DECEAS', libelle: 'àééYi' },
    { code: 'DECEEMP', libelle: 'Décès employeur' },
    { code: 'DECSAL', libelle: 'Décès salarié' },
    { code: 'DEF', libelle: 'Décès dans l’exercice des fonctions' },
    { code: 'DEM', libelle: 'Demission' },
    { code: 'DET', libelle: 'Détachement' },
    { code: 'FCO', libelle: 'Fin de contrat' },
    { code: 'FDE', libelle: 'FIN DE DETACHEMENT' },
    { code: 'FDM', libelle: 'FIN DE MANDAT (ELU)' },
    { code: 'FINEIMP', libelle: 'Fin période essai initiative employeur' },
    { code: 'FINSAL', libelle: 'Fin période essai initiative salarié' },
    { code: 'FST', libelle: 'Fin de stage' },
    { code: 'FTD', libelle: 'Fine contratto tempo determinato' },
    { code: 'FVC', libelle: 'FIN DE VACATION' },
    { code: 'IAEND', libelle: 'Fin de l’affectation internationale' },
    { code: 'INTE', libelle: 'INTEGRATION SUR L’ETAT' }
  ];

  constructor(
    public dialogRef: MatDialogRef<PopupMotifEntreeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.Motifs = [...this.rows];
    this.filterItems(); // Initialize filteredMotifs
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
      alert('Veuillez sélectionner un Motif');
    }
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
