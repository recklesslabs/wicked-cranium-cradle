import { Component, ViewChild } from '@angular/core';
import { ContractService } from '../services/contract.service';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { map } from 'rxjs/operators';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Navigation, SwiperOptions } from 'swiper';
import { GlobleService } from '../services/globle.service';
import { CommentService } from '../services/comment.service';
import { testnetAbi, testnetContract } from '../constants';
import Moralis from 'moralis';

SwiperCore.use([Navigation]);

declare var Web3: any;
declare var window: any;

export interface UserComments {
  meta_add: string;
  commentMessage: string;
  commentTime: string;
  tokenId: string;
  perentCmtId: '';
  subComment: [
    {
      meta_add: string;
      subCommnetMessage: string;
      subCommentTime: string;
      commentTo: string;
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
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  title = 'virtual-scroll';
  pk: string = '';
  getTokens: any;
  DbRef: any;
  DbCmtRef: any;
  dbUsersImage: any;
  dbComments: any;
  allComment: any;
  allSubComment: any;
  pfpToken: any;
  totalComments: number;
  cmt_replay: boolean = false;
  subCmt_replay: boolean = false;
  cmtReplayInputId: any;
  subCmtReplayInputId: any;
  userCmtReplay: any = '';
  userSubCmtReplay: any = '';
  tokensArr: any;
  tokensObj: any;
  tokensArrObj: any[] = [];
  sliderTokenId: number | 0;

  config: SwiperOptions = {
    // initialSlide: this.sliderTokenId,
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: true
  };

  userSubComment: any = {
    meta_add: '',
    subCommnetMessage: '',
    subCommentTime: firebase.firestore.Timestamp.now(),
    commentTo: '',
    perentCmtId: '',
  };

  userComment: any = {
    meta_add: '',
    token_Id: '',
    commentMessage: '',
    commentTime: firebase.firestore.FieldValue.serverTimestamp(),
    subComment: [],
  };

  constructor(
    public db: AngularFirestore,
    public contractService: ContractService,
    public commentService: CommentService,
    public globleService: GlobleService
  ) {
    // this.getAddress();
    this.pfpData();
    this.getComments();
    var accoutData = this.contractService.getAccoutData();
    this.tokensArr = accoutData.tokens;
    this.tokenDataObj();
  }

  tokenDataObj() {
    this.db
      .collection('tokenidtodata')
      .ref.where('id', 'in', this.tokensArr)
      .get()
      .then((res) => {
        res.docs.map((doc: any) => {
          this.tokensObj = doc.data();
          this.tokensArrObj.push(doc.data());
        });
      });
  }

  tokenData(tData: any) {
    this.pfpToken = tData;
    this.getComments();
  }

  async pfpData() {
    this.pfpToken = await this.globleService.getCurrentPFP();
    this.sliderTokenId = Number(
      this.tokensArrObj.findIndex((x) => x.id === this.pfpToken)
    );
  }

  async otherUserData(walletAddr: any) {
    var pfpTokenData = await this.globleService.globalTokensData(walletAddr);
    return pfpTokenData;
  }

  allInputClose(): void {
    this.cmt_replay = false;
    this.subCmt_replay = false;
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
      .subscribe(async (data: object) => {
        this.dbComments = data;
        this.allComment = await Promise.all(
          this.dbComments.map(async (commentData: any) => {
            const { id: documentId } = commentData;
            return {
              ...commentData,
              ...(await this.otherUserData(commentData.meta_add)),
              documentId: documentId,
            };
          })
        );
        this.dbComments = this.allComment;
        this.allSubComment = await Promise.all(
          this.dbComments.map(async (sub: any) => {
            return await Promise.all(
              sub.subComment.map(async (subCommentData: any) => {
                const { id: tokenId, name: userName } =
                  await this.otherUserData(subCommentData.meta_add);
                var nameOfComment;
                if (subCommentData.commentTo) {
                  var commentToObj = await this.otherUserData(
                    subCommentData.commentTo
                  );
                  nameOfComment = '@' + commentToObj.name;
                }
                return {
                  ...subCommentData,
                  ...(await this.otherUserData(subCommentData.meta_add)),
                  nameOfComment: nameOfComment,
                  tokenId: tokenId,
                  userName: userName,
                };
              })
            );
          })
        );
        this.dbComments.map((d: any) => {
          return (d.subComment = this.allSubComment.flat(2));
        });
        this.totalComments = this.dbComments.length;
      });
  }

  saveComment(tId: any): void {
    this.userComment.token_Id = tId;
    this.commentService.create(this.userComment).then(() => {
      this.userComment.commentMessage = '';
      this.allInputClose();
    });
  }

  saveSubComment(docId: any, commentTo: string) {
    this.userSubComment.perentCmtId = docId;
    this.userSubComment.commentTo = commentTo;
    this.DbCmtRef = this.db
      .collection('comments')
      .doc(docId)
      .update({
        subComment: firebase.firestore.FieldValue.arrayUnion(
          this.userSubComment
        ),
      });
    this.userSubComment.subCommnetMessage = '';
    this.allInputClose();
  }

  cmtReplay(id: any, name: string): boolean {
    this.cmtReplayInputId = id;
    this.userCmtReplay = name;
    this.userSubComment.commentTo = '';
    this.allInputClose();
    return (this.cmt_replay = true);
  }

  cancleCmtReplay(): boolean {
    return (this.cmt_replay = false);
  }

  subCmtReplay(id: any, name: string) {
    this.subCmtReplayInputId = id;
    this.userSubCmtReplay = name;
    this.allInputClose();
    return (this.subCmt_replay = true);
  }

  cancleSubCmtReplay(): boolean {
    return (this.subCmt_replay = false);
  }
}
