import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { ContractService } from '../app/services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;
  pk: string = '';
  tokens: number[] = [];
  message = 'login with metamask!';
  userToken: string = '';
  getTokens: any;

  constructor(
    public contractService: ContractService,
    public db: AngularFirestore,
    private router: Router
  ) {
    var walletData: any = localStorage.getItem('walletData');
    if (walletData != null) {
      var jsonObj: any = JSON.parse(walletData);
      this.getTokens = this.contractService.decryptObj(
        jsonObj.WCtoken,
        jsonObj.address
      );
      if (this.getTokens.tokens.length == 0) {
        this.message = 'Could not find Wicked Craniums in your Metamask';
      } else {
        this.tokens = this.getTokens.tokens;
      }
    }


    this.contractService.isLoading.subscribe((value: any) => {
      this.loading = value;
    });
  }

  ngOnInit(): void { }

  async login() {
    this.message = 'logging in...';
    let getTokensRes = await this.contractService.getTokens();
    if (getTokensRes) {
      this.tokens = getTokensRes.tokens;
      const isValid = getTokensRes.tokens.length > 0;
      localStorage.setItem(
        'tokens',
        JSON.parse(JSON.stringify(getTokensRes.tokens))
      );
      if (isValid) {
        this.pk = getTokensRes.pk;
        this.createUser(getTokensRes.tokens, getTokensRes.pk);
        this.router.navigateByUrl('/home');
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
