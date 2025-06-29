import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-popup-conf-maladie',
  imports: [
    MatIconButton
  ],
  standalone: true,
  templateUrl: './popup-conf-maladie.component.html',
  styleUrl: './popup-conf-maladie.component.css'
})
export class PopupConfMaladieComponent {

  constructor(
    public dialogRef: MatDialogRef<PopupConfMaladieComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onClose(): void {
    this.dialogRef.close(false);
  }

  onYes(): void {
    this.dialogRef.close(true);
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
