import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-popup-nature-heure',
  imports: [MatButtonModule, MatCheckboxModule, MatIconModule, FormsModule, NgIf],
  templateUrl: './popup-nature-heure.component.html',
  styleUrl: './popup-nature-heure.component.css'
})
export class PopupNatureHeureComponent {
  constructor(
    public dialogRef: MatDialogRef<PopupNatureHeureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // À implémenter : validation et enregistrement selon data.type (add/edit)
    if (this.data.type === 'add' || this.data.type === 'edit') {
      this.dialogRef.close({ action: this.data.type, data: {} }); // Placeholder pour les données
    } else {
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  protected readonly JSON = JSON;
}
