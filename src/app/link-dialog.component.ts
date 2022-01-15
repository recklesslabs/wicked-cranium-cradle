import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-link-dialog',
  template: `
    <h3>{{ data.name }}'s link:</h3>
    <p>{{ data.link }}</p>
  `,
  styles: [],
})
export class LinkDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<LinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
}
