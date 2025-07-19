import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {NatureHeure} from '../models/journee/NatureHeureModel';

@Component({
  selector: 'app-popup-nature-heure',
  imports: [MatButtonModule, MatCheckboxModule, MatIconModule, FormsModule, NgIf, NgForOf],
  standalone: true,
  templateUrl: './popup-nature-heure.component.html',
  styleUrl: './popup-nature-heure.component.css'
})
export class PopupNatureHeureComponent {
  natureHeure: NatureHeure = {
    nature_heure: '',
    heureDebut: '',
    heureFin: '',
    duree: '',
    isValidee: false,
    commentaire: ''
  };

  natureOptions = [
    { value: 'Absence justifiée', label: 'Absence justifiée' },
    { value: 'Déjeuner', label: 'Déjeuner' },
    { value: 'Réunion', label: 'Réunion' },

  ];
  constructor(
    public dialogRef: MatDialogRef<PopupNatureHeureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.type === 'edit' || this.data.type === 'detail') {
      this.natureHeure = { ...this.data.item! };
      console.log('Initialized natureHeure:', this.natureHeure);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.type === 'add' || this.data.type === 'edit') {
      // Basic validation
      if (!this.natureHeure.nature_heure || !this.natureHeure.heureDebut || !this.natureHeure.heureFin) {
        console.error('Missing required fields');
        return;
      }
      this.dialogRef.close(this.natureHeure);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  calculateDuree(): void {
    if (this.natureHeure.heureDebut && this.natureHeure.heureFin) {
      const [startHour, startMinute] = this.natureHeure.heureDebut.split(':').map(Number);
      const [endHour, endMinute] = this.natureHeure.heureFin.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const diffMinutes = endMinutes - startMinutes;
      if (diffMinutes > 0) {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        this.natureHeure.duree = `${hours}h${minutes.toString().padStart(2, '0')}`;
      } else {
        this.natureHeure.duree = '-';
      }
    }
  }

}
