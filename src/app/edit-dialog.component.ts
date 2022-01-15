import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-dialog',
  template: `
    <div mat-dialog-content>
      <p>What shall we call this Cranium?</p>
      <mat-form-field>
        <input placeholder="name" matInput [(ngModel)]="data.name" />
      </mat-form-field>
      <p>Tell us their story:</p>
      <mat-form-field>
        <textarea
          rows="8"
          cols="80"
          placeholder="story"
          matInput
          [(ngModel)]="data.bio"
        ></textarea>
      </mat-form-field>
      <p>Drop a link</p>
      <mat-form-field>
        <input placeholder="link" matInput [(ngModel)]="data.link" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button [mat-dialog-close]="data" cdkFocusInitial>LFG!</button>
    </div>
  `,
  styles: [],
})
export class EditDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
