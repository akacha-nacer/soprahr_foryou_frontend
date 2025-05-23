import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popup-question-rh',
  standalone: true,
  imports: [MatButtonModule, MatCheckboxModule, MatIconModule, FormsModule],
  templateUrl: './popup-question-rh.component.html',
  styleUrls: ['./popup-question-rh.component.css']
})
export class PopupQuestionRhComponent {
  includeImage = false;

  constructor(
    public dialogRef: MatDialogRef<PopupQuestionRhComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onYes(): void {
    console.log('Oui clicked');
  }

  onNo(): void {
    this.dialogRef.close();
  }
}
