import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss'],
})
export class StoriesComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  batch = 10;
  theEnd = false;

  constructor(
    public db: AngularFirestore,
    private router: Router,
    public globalService: GlobalService,
  ) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n) => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );
    this.infinite = batchMap.pipe(map((v) => Object.values(v)));
  }

  trackByIdx(i: any) {
    return i;
  }

  openProfile = async (tokenId: string) => {
    var TokenAddress = await this.globalService.getAddressFromToken(tokenId);
    this.router.navigate(['/', 'profile', tokenId, TokenAddress]);
  };

  getBatch(offset: any) {
    return this.db
      .collection('tokenidtodata', (ref) =>
        ref.orderBy('id').startAfter(offset).limit(this.batch)
      )
      .snapshotChanges()
      .pipe(
        tap((arr) => (arr.length ? null : (this.theEnd = true))),
        map((arr) => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const data = cur.payload.doc.data();
            const res = { ...acc, [id]: data };
            return res;
          }, {});
        })
      );
  }

  nextBatch(e: any, offset: any) {
    if (this.theEnd) {
      return;
    }
    const end = (this.viewport as CdkVirtualScrollViewport).getRenderedRange().end;
    const total = (this.viewport as CdkVirtualScrollViewport).getDataLength();
    if (end === total) {
      this.offset.next(offset);
    }
  }

  ngOnInit(): void {}
}
