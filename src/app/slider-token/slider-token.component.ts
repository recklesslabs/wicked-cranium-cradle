import { SwiperComponent } from 'swiper/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap, scan, throttleTime } from 'rxjs/operators';
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { EditDialogComponent } from '../dialogs/edit-dialog.component';
import { ContractService } from '../services/contract.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-slider-token',
  templateUrl: './slider-token.component.html',
  styleUrls: ['./slider-token.component.scss'],
})
export class SliderTokenComponent implements OnInit {
  @ViewChild('customSwiper', { static: false }) customSwiper: SwiperComponent;
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  @Output('tokenDataObj') tokenDataObj: EventEmitter<any> = new EventEmitter();

  onBack() {
    this.customSwiper.swiperRef.slidePrev();
  }

  onNext() {
    this.customSwiper.swiperRef.slideNext();
  }

  batch = 10;
  tokens: number[] = [];
  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  pfpToken: any;
  direction: string[] | undefined;

  constructor(
    public dialog: MatDialog,
    public db: AngularFirestore,
    public contractService: ContractService,
    public globalService: GlobalService,
    private route: ActivatedRoute
  ) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n) => contractService.getTokenImg(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    var walletData: any = localStorage.getItem('walletData');
    var jsonObj: any = JSON.parse(walletData);
    var tokenObj = this.contractService.decryptObj(
      jsonObj.WCtoken,
      jsonObj.address
    );
    this.tokens = tokenObj.tokens;

    this.infinite = batchMap.pipe(map((v) => Object.values(v)));
    this.pfpData();
  }
  title = 'virtual-scroll';

  pk: string = '';
  ngOnInit(): void {}

  async pfpData() {
    this.pfpToken = await this.globalService.getCurrentPFP();
  }

  async setPfpFalse(): Promise<any> {
    if (this.pfpToken != undefined) {
      this.db
        .collection('tokenidtodata')
        .ref.where('id', '==', this.pfpToken)
        .get()
        .then((docs) => {
          docs.forEach(function (doc: any) {
            doc.ref.update({
              set_as_pfp: false,
            });
          });
        });
    }
  }

  openEditDialog(token: number) {
    this.pfpData()
    let param = {
      id: token,
      name: '',
      bio: '',
      twitter_link: '',
      discord_link: '',
      set_as_pfp: false,
      opt_in_loc: false,
      location: 0,
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.token.set_as_pfp != undefined) {
          this.setPfpFalse();
          this.pfpToken = result.token.id;
        }
       
        this.db
          .collection('tokenidtodata')
          .ref.where('id', '==', result.token.id)
          .get()
          .then(({ docs }) => {
            if (docs.length == 0) {
              this.db
                .collection('tokenidtodata')
                .doc(result.token.id.toString())
                .set({
                  id: result.token.id,
                  name: result.token.name,
                  bio: result.token.bio,
                  twitter_link: result.token.twitter_link,
                  discord_link: result.token.discord_link,
                  set_as_pfp: result.token.set_as_pfp,
                  opt_in_loc: result.token.opt_in_loc,
                  location: result.token.location,
                });
            } else {
              this.db
                .collection('tokenidtodata', (ref) =>
                  ref.where('id', '==', result.token.id)
                )
                .doc(result.token.id.toString())
                .update({
                  name: result.token.name,
                  bio: result.token.bio,
                  twitter_link: result.token.twitter_link,
                  discord_link: result.token.discord_link,
                  set_as_pfp: result.token.set_as_pfp,
                  opt_in_loc: result.token.opt_in_loc,
                  location: result.token.location,
                });
            }
            if (!this.route.snapshot.paramMap.get('token') || !this.route.snapshot.paramMap.get('tokenAddr')) 
            {
              this.tokenDataObj.emit();
            }
          });
      }
    });
  }
}
