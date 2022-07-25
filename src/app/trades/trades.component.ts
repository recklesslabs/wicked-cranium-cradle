import { Component, OnInit } from '@angular/core';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-token',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss'],
})
export class TradesComponent implements OnInit {
  loading = true;
  nftData: any | undefined = [];

  constructor(public tokenService: TokenService) {
    this.tokenInsite();
  }

  ngOnInit(): void {}

  tokenInsite() {
    this.loading = true;
    setTimeout(() => {
      this.tokenService.getNFTTrades().then((result) => {
        this.nftData = result;
        this.loading = false;
      });
    }, 1000);
  }
}
