import { Component, OnInit } from '@angular/core';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss'],
})
export class TokenComponent implements OnInit {
  loading = true;
  nftData: any | undefined = [];

  constructor(public tokenService: TokenService) {
    this.tokenInsite();
  }

  ngOnInit(): void {}

  tokenInsite() {
    this.loading = true;
    setTimeout(() => {
      this.tokenService.getNftData().then((result) => {
        this.nftData = result;
        this.loading = false;
      });
    }, 1000);
  }
}
