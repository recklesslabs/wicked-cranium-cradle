import { Router } from '@angular/router';
import { Location } from "@angular/common";
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractService } from '../app/services/contract.service';
import { TokenService } from './services/token.service';

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
    private router: Router,
    public tokenService: TokenService,
    public location: Location
  ) {
    this.contractService.isLoading.subscribe((value: any) => {
      this.loading = value;
    });

    var walletData: any = localStorage.getItem('walletData');
    if (walletData != null) {
      var jsonObj: any = JSON.parse(walletData);
      this.getTokens = this.contractService.decryptObj(
        jsonObj.WCtoken,
        jsonObj.address
      );
      if (this.getTokens.tokens.length == 0) {
        this.message = 'Could not find Wicked Craniums in your Wallet';
      } else {
        this.tokens = this.getTokens.tokens.length;
        if (location.path() != "") {
          this.router.navigateByUrl(location.path());
        } else {
          this.router.navigateByUrl('/profile');
        }
      }
    }
  }

  ngOnInit(): void {}

  async login() {
    this.message = 'logging in...';
    this.contractService.message.subscribe((value: any) => {
      this.message = value;
    });
    let getTokensRes = await this.contractService.getTokens();
    if (getTokensRes) {
      this.tokens = getTokensRes.tokens;
      const isValid = getTokensRes.tokens.length > 0;
      if (isValid) {
        this.pk = getTokensRes.pk;
        this.createUser(getTokensRes.tokens, getTokensRes.pk);
        this.router.navigateByUrl('/profile');
        return true;
      } else {
        this.message = 'Could not find Wicked Craniums in your Wallet';
        return false;
      }
    } else {
      this.message = 'Could not find Wicked Craniums in your Wallet';
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
