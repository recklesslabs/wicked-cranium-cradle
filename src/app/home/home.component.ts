import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from '../services/contract.service';
import { EditDialogComponent } from '../dialogs/edit-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime } from 'rxjs/operators';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Navigation } from 'swiper';
import { PostService } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { CommentService } from '../services/comment.service';

SwiperCore.use([Navigation]);

export interface UserPosts {
  meta_add: string;
  postMessage: any;
  postTime: any;
}

export interface UserComments {
  meta_add: string;
  commentMessage: string;
  commentTime: string;
  subComment: [
    {
      meta_add: string;
      subCommnetMessage: string;
      subCommentTime: string;
    }
  ];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('customSwiper', { static: false }) customSwiper: SwiperComponent;

  title = 'virtual-scroll';
  pk: string = '';
  tokens: number[] = [];
  DbRef: any;
  DbCmtRef: any;
  dbUsersImage: any;
  dbPosts: any;
  dbComments: any;
  batch = 10;
  theEnd = false;
  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  post_replay: boolean = false;
  cmt_replay: boolean = false;
  subCmt_replay: boolean = false;
  postReplayInputId: any;
  cmtReplayInputId: any;
  subCmtReplayInputId: any;

  userPost: any = {
    meta_add: '',
    postMessage: '',
    postTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  subComments: any = {
    meta_add: '',
    subCommnetMessage: '',
    subCommentTime: firebase.firestore.Timestamp.now(),
  };

  userComment: any = {
    perentCmtId: '',
    meta_add: '',
    commentMessage: '',
    commentTime: firebase.firestore.FieldValue.serverTimestamp(),
    subComment: [],
  };

  @ViewChild(CdkVirtualScrollViewport)
  viewport?: CdkVirtualScrollViewport;

  constructor(
    public contractService: ContractService,
    public dialog: MatDialog,
    public db: AngularFirestore,
    public postService: PostService,
    public authService: AuthService,
    public commentService: CommentService
  ) {
    this.setPfp();
    this.getImages();
    this.getPosts();
    this.getComments();
    this.getAddress();

    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n) => contractService.getTokenImg(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    this.infinite = batchMap.pipe(map((v) => Object.values(v)));
  }

  allInputClose(): void {
    this.post_replay = false;
    this.cmt_replay = false;
    this.subCmt_replay = false;
  }

  postReplay(id: any): boolean {
    this.postReplayInputId = id;
    this.allInputClose();
    return (this.post_replay = true);
  }

  canclePostReplay(): boolean {
    return (this.post_replay = false);
  }

  cmtReplay(id: any): boolean {
    this.allInputClose();
    this.cmtReplayInputId = id;
    return (this.cmt_replay = true);
  }

  cancleCmtReplay(): boolean {
    return (this.cmt_replay = false);
  }

  subCmtReplay(id: any): boolean {
    this.allInputClose();
    this.subCmtReplayInputId = id;
    return (this.subCmt_replay = true);
  }

  cancleSubCmtReplay(): boolean {
    return (this.subCmt_replay = false);
  }

  getAddress = async () => {
    var accAddress = await this.authService.getLoggedIn();
    this.userPost.meta_add = accAddress[0];
    this.userComment.meta_add = accAddress[0];
    this.subComments.meta_add = accAddress[0];
  };

  getPosts(): void {
    this.postService
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data: object) => {
        this.dbPosts = data;
      });
  }

  savePost(): void {
    this.postService.create(this.userPost).then(() => {
      this.userPost.postMessage = '';
      this.allInputClose();
    });
  }

  getComments(): void {
    this.commentService
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data: object) => {
        this.dbComments = data;
      });
  }

  saveUserComment(pid: any, cid: any): void {
    this.userComment.perentCmtId = pid;
    this.commentService.create(this.userComment).then(() => {
      this.userComment.commentMessage = '';
      this.allInputClose();
    });
  }

  subComment(cid: any, pid: any): void {
    this.userComment.perentCmtId = pid;
    // firebase.database().ref('/userComment').push(this.subCmt);
    this.DbCmtRef = this.db
      .collection('comments')
      .doc(cid)
      .update({
        subComment: firebase.firestore.FieldValue.arrayUnion(this.subComments),
      });
    this.subComments.subCommnetMessage = '';
    this.allInputClose();
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

  trackByIdx(i: any) {
    return i;
  }

  getAll(): any {
    return this.DbRef;
  }

  setPfp() {
    this.DbRef = this.db.collection('tokenidtodata', (ref) =>
      ref.where('set_as_pfp', '==', true)
    );
  }

  getImages() {
    this.getAll()
      .snapshotChanges()
      .pipe(
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data: object) => {
        this.dbUsersImage = data;
      });
  }

  openEditDialog(token: number) {
    let param = {
      bio: '',
      id: token,
      link: '',
      name: '',
    };
    if (typeof token === 'object') {
      param = token;
    }
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        pk: this.pk,
        token: param,
      },
    });
  }
}
