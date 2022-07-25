import firebase from 'firebase/app';
import SwiperCore, { Navigation } from 'swiper';
import { Component, ViewChild } from '@angular/core';
import { debounceTime, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ContractService } from '../services/contract.service';
import { GlobalService } from '../services/global.service';
import { CommentService } from '../services/comment.service';
import { TokenService } from '../services/token.service';

SwiperCore.use([Navigation]);

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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  @ViewChild('profileSlider') profileSlider: any;

  title = 'virtual-scroll';
  pk: string = '';
  DbCmtRef: any;
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
  tokensArrObj: any[] = [];
  sliderTokenId: number;
  sliderIndexId: number | 0;
  accoutData: any;

  userSubComment: any = {
    meta_add: '',
    subCommnetMessage: '',
    subCommentTime: firebase.firestore.Timestamp.now(),
    commentTo: '',
    perentCmtId: '',
  };

  userComment: any = {
    meta_add: '',
    token_id: '',
    commentMessage: '',
    commentTime: firebase.firestore.FieldValue.serverTimestamp(),
    subComment: [],
  };

  constructor(
    public db: AngularFirestore,
    public contractService: ContractService,
    public commentService: CommentService,
    public globalService: GlobalService,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    private router: Router
  ) {

    this.accoutData = this.contractService.getAccoutData();
    var accountDetails = this.accoutData;
    this.setAddress(accountDetails.address);
    this.tokensArr = accountDetails.tokens;
    this.tokenDataObj();
  }

  onBack(tokenId: number) {
    if (tokenId != undefined) {
      this.sliderIndexId = tokenId
      this.pfpToken = this.tokensArrObj[tokenId].id;
      this.getComments(this.pfpToken);
      this.profileSlider.swiperRef.slidePrev();
    }
  }

  onNext(tokenId: number) {
    if (tokenId != undefined) {
      this.sliderIndexId = tokenId
      this.pfpToken = this.tokensArrObj[tokenId].id;
      this.getComments(this.pfpToken);
      this.profileSlider.swiperRef.slideNext();
    }
  }

  async tokenDataObj() {
    if (this.route.snapshot.paramMap.get('token') || this.route.snapshot.paramMap.get('tokenAddr')) {
      var otherUserAddr = this.route.snapshot.paramMap.get('tokenAddr');
      var pfpTokenData = await this.globalService.getDataOtherAddr(otherUserAddr);
      this.tokensArrObj = pfpTokenData;
      var otherUserToken: any = this.route.snapshot.paramMap.get('token');
      this.sliderIndexId = this.tokensArrObj.findIndex((x) => x.id == otherUserToken)
      this.sliderTokenId = Number(
        this.tokensArrObj.findIndex((x) => x.id == otherUserToken)
      );
      this.getComments(otherUserToken);
      this.profileSlider.swiperRef.slideTo(this.sliderTokenId, 3000);
    } else {
      this.pfpData();
      this.tokensArrObj = await this.globalService.getCurrentProfile();
    }
  }

  tokenData(tData: any) {
    this.pfpToken = tData;
    this.sliderTokenId = Number(this.tokensArrObj.findIndex((x) => x.id === this.pfpToken));
    this.profileSlider.swiperRef.slideTo(this.sliderTokenId, 2000);
    this.sliderIndexId = this.tokensArrObj.findIndex((x) => x.id == this.pfpToken)
    this.getComments(this.pfpToken);
  }

  async pfpData() {
    this.pfpToken = await this.globalService.getCurrentPFP();
    this.sliderTokenId = Number(
      this.tokensArrObj.findIndex((x) => x.id === this.pfpToken)
    );
    this.profileSlider.swiperRef.slideTo(this.sliderTokenId, 2000);
    this.sliderIndexId = this.tokensArrObj.findIndex((x) => x.id == this.pfpToken)
    this.getComments(this.pfpToken);
  }

  async otherUserData(walletAddr: any) {
    if (this.accoutData.address == walletAddr && (!this.route.snapshot.paramMap.get('token') || !this.route.snapshot.paramMap.get('tokenAddr'))) {
      return this.tokensArrObj[this.sliderIndexId];
    } else {
      var pfpTokenData = await this.globalService.globalTokensData(walletAddr);
      // var pfpTokenArr = await this.globalService.getGlobalProfile(walletAddr);
      // var pfpTokenData: any = pfpTokenArr.find((x: any) => x.set_as_pfp == true);
      return pfpTokenData;
    }
  }

  allInputClose(): void {
    this.cmt_replay = false;
    this.subCmt_replay = false;
  }

  setAddress = (address: string) => {
    this.userComment.meta_add = address;
    this.userSubComment.meta_add = address;
  };

  openProfile = async (tokenId: number) => {
    var TokenAddress = await this.tokenService.getAddressFromToken(tokenId);
    this.router.navigate(['/', 'profile', tokenId, TokenAddress]);
  };

  getComments(pfpToken: number): void {
    this.commentService.comment(Number(pfpToken));
    this.commentService
      .getAll()
      .snapshotChanges()
      .pipe(
        debounceTime(500),
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
        this.totalComments = this.dbComments.length;
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
      });
  }

  saveComment(tId: any): void {
    this.userComment.token_id = tId;
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

  restrictSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === 'Space') {
      event.preventDefault();
    }
  }
}
