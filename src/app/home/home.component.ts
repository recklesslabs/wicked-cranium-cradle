import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from '../contract.service';
import { EditDialogComponent } from '../edit-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime } from 'rxjs/operators';
import * as faker from 'faker';
import { LinkDialogComponent } from '../link-dialog.component';

import { SwiperComponent } from "swiper/angular";

import SwiperCore, { Navigation } from "swiper";

// install Swiper modules
SwiperCore.use([Navigation]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  @ViewChild('customSwiper', { static: false}) customSwiper:SwiperComponent;

  onBack(){
    this.customSwiper.swiperRef.slidePrev();
}

onNext(){
    this.customSwiper.swiperRef.slideNext();
}

  title = 'virtual-scroll';

  pk: string = '';
  isLoggedIn = false;
  tokens: number[] = [];
  message = 'login with metamask!';
  userToken: string = '';

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
    this.userToken = localStorage.getItem("tokens") as string;

    if(this.userToken){
      for (let token of this.userToken.split(',')) {
        this.tokens.push(Number(token));
      }
    }

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
      localStorage.setItem('tokens', JSON.parse(JSON.stringify(getTokensRes.tokens)));
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

  // clickedHeader(link: string, name: string) {
  //   this.dialog.open(LinkDialogComponent, {
  //     // width: '300px',
  //     data: {
  //       link: link,
  //       name: name,
  //     },
  //   });
  // }

  // updateFirebaseDocument(collectionName, documentId, field, updateValue) {
  //     var doc = this.db.collection('tokenidtodata').doc('13');

  //     var obj = {}
  //     obj[field] = updateValue;
  
  //     return doc.update(obj)
  //     .then(function() {
  //         console.log("Document successfully updated!");
  //     })
  //     .catch(function(error) {
  //         // The document probably doesn't exist.
  //         console.error("Error updating document: ", error);
  //     });
  // }

  openEditDialog(token: number) {
    let param = {
      bio: '',
      id: token,
      link: '',
      name: '',
    }
    if (typeof token === 'object') {
      param = token;
    }
    const dialogRef = this.dialog.open(EditDialogComponent, {
      // width: '300px',
      data: {
        pk: this.pk,
        token: param,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.db.collection('tokenidtodata')
          .ref.where("id", '==', result.token.id)  
          .get()
          .then(({ docs }) => {
            if (docs.length == 0) {
              this.db.collection('tokenidtodata').doc(result.token.id.toString()).set({
                id: result.token.id,                
                name: result.token.name,
                bio: result.token.bio,
                twitter_link: result.token.twitter_link,
                discord_link: result.token.discord_link,
                set_as_pfp: result.token.set_as_pfp,
                opt_in_loc: result.token.opt_in_loc,
                location: result.token.location
                
              });
            } else {
              this.db.collection('tokenidtodata', (ref) => ref.where("id", "==", result.token.id)).doc(result.token.id.toString()).update({
                name: result.token.name,
                bio: result.token.bio,
                twitter_link: result.token.twitter_link,
                discord_link: result.token.discord_link,
                set_as_pfp: result.token.set_as_pfp,
                opt_in_loc: result.token.opt_in_loc,
                location: result.token.location
              });
            }
          });
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
