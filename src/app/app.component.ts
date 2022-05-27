import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { AuthService } from './services/auth.service';
import { ContractService } from '../app/services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;
  constructor(
    public contractService: ContractService,
    public authService: AuthService,
    public db: AngularFirestore,
    private router: Router
  ) {
    // this.chkLogin();
    // this.userToken = localStorage.getItem("tokens") as string;
    // if(this.userToken){
    //   for (let token of this.userToken.split(',')) {
    //     this.tokens.push(Number(token));
    //   }
    // }
    this.router.events.subscribe((event: any) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          setTimeout(() => {
            this.loading = false;
          }, 2000);
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  pk: string = '';
  tokens: number[] = [];
  message = 'login with metamask!';
  NftTokens = localStorage.getItem('tokens');
  userToken: string = '';
  isLogin: boolean = false;
  loader: boolean = true;

  ngOnInit(): void {}

  // async chkLogin() {
  //   let getTokensRes = await this.authService.setTokens();
  //   if (getTokensRes) {
  //     this.message = 'logging in...';
  //     this.tokens = getTokensRes.tokens;
  //   }else{
  //     localStorage.clear();
  //   }
  // }

  async login() {
    this.message = 'logging in...';
    let getTokensRes = await this.contractService.getTokens();
    if (getTokensRes) {
      this.isLogin = true;
      this.tokens = getTokensRes.tokens;
      const isValid = getTokensRes.tokens.length > 0;
      localStorage.setItem(
        'tokens',
        JSON.parse(JSON.stringify(getTokensRes.tokens))
      );
      if (isValid) {
        this.pk = getTokensRes.pk;
        this.createUser(getTokensRes.tokens, getTokensRes.pk);
        this.router.navigateByUrl('/home').then(() => {
          // window.location.reload();
        });
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
