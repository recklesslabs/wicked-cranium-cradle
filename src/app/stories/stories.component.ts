import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime } from 'rxjs/operators';
import firebase from 'firebase/app';

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

  constructor(public db: AngularFirestore) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n) => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );
    this.infinite = batchMap.pipe(map((v) => Object.values(v)));
  }

  openEditDialog(token: number) {
    console.log(token);
  }

  trackByIdx(i: any) {
    return i;
  }

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

    const end = (this.viewport as CdkVirtualScrollViewport).getRenderedRange()
      .end;
    const total = (this.viewport as CdkVirtualScrollViewport).getDataLength();
    if (end === total) {
      this.offset.next(offset);
    }
  }

  ngOnInit(): void { }
}
