import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from './contract.service';
import { EditDialogComponent } from './edit-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime } from 'rxjs/operators';
import * as faker from 'faker';
import { LinkDialogComponent } from './link-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'virtual-scroll';

  pk: string = '';
  isLoggedIn = false;
  tokens: number[] = [];
  message = 'login with metamask!';

  @ViewChild(CdkVirtualScrollViewport)
  viewport?: CdkVirtualScrollViewport;

  batch = 10;
  theEnd = false;

  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;

  constructor(
    public contractService: ContractService,
    public dialog: MatDialog,
    public db: AngularFirestore
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

  getProducts(products_ids: number[]) {
    var queryId = firebase.firestore.FieldPath.documentId();
    this.db
      .collection('tokenidtodata')
      .ref.where(queryId, 'in', products_ids)
      .get()
      .then(({ docs }) => {
        console.log(docs.map((doc) => doc.data()));
      });
  }

  // writeFakeData() {
  //   let fakeDataList = [];
  //   for (let i = 0; i < 10000; i++) {
  //     fakeDataList.push({
  //       name: faker.name.findName(),
  //       bio: faker.hacker.phrase(),
  //       link: 'twitter.com/wickedderb',
  //       id: i + 1,
  //     });
  //   }

  //   fakeDataList.forEach((e) => {
  //     this.db.collection('tokenidtodata').doc(e.id.toString()).set(e);
  //   });
  // }

  getBatch(offset: any) {
    // console.log(offset);
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
            // console.log(res);
            return res;
          }, {});
        })
      );
  }

  nextBatch(e: any, offset: any) {
    // console.log(`event: ${e}`);
    // console.log(`this.theEnd: ${this.theEnd}`);
    if (this.theEnd) {
      return;
    }

    const end = (this.viewport as CdkVirtualScrollViewport).getRenderedRange()
      .end;
    const total = (this.viewport as CdkVirtualScrollViewport).getDataLength();
    // console.log(`${end}, '>=', ${total}`);
    if (end === total) {
      // console.log(`offset: ${offset}`);

      this.offset.next(offset);
    }
  }

  trackByIdx(i: any) {
    return i;
  }

  async login() {
    this.message = 'logging in...';
    let getTokensRes = await this.contractService.getTokens();
    if (getTokensRes) {
      this.tokens = getTokensRes.tokens;
      const isValid = getTokensRes.tokens.length > 0;
      if (isValid) {
        // setting pk:
        this.pk = getTokensRes.pk;
        this.createUser(getTokensRes.tokens, getTokensRes.pk);
        return true;
      } else {
        this.message = 'Could not find Wicked Craniums in your Metamask';
        return false;
      }
    } else {
      this.message = 'Could not verify you via Metamask';
      return false;
    }
  }

  clickedHeader(link: string, name: string) {
    this.dialog.open(LinkDialogComponent, {
      width: '300px',
      data: {
        link: link,
        name: name,
      },
    });
  }

  openEditDialog(token: number) {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: '300px',
      data: {
        pk: this.pk,
        token: token,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.collection('tokenidtodata').doc(result.token.toString()).set({
          bio: result.bio,
          id: result.token,
          link: result.link,
          name: result.name,
        });

        console.log(`the result after close is: ${JSON.stringify(result)}`);
      }
    });
  }

  async createUser(tokens: number[], pk: string) {
    this.db
      .collection('pktotokenid')
      .doc(pk)
      .set({
        tokenIds: tokens.sort(function (a, b) {
          return a - b;
        }),
      });
  }
}
