import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap, scan, tap, throttleTime } from 'rxjs/operators';
import { ImageDialogComponent } from '../dialogs/image-dialog/image-dialog.component';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  batch = 10;
  theEnd = false;
  tokens: number[] = [];
  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  userToken: string = '';

  constructor(
    public contractService: ContractService,
    public db: AngularFirestore,
    public dialog: MatDialog
  ) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n) => contractService.getTokenImg(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );
    this.userToken = localStorage.getItem('tokens') as string;

    if (this.userToken) {
      for (let token of this.userToken.split(',')) {
        this.tokens.push(Number(token));
      }
    }

    this.infinite = batchMap.pipe(map((v) => Object.values(v)));
  }

  ngOnInit(): void {}

  openDialog(tokenId: any) {
    this.dialog.open(ImageDialogComponent, {
      data: tokenId,
    });
  }
}
