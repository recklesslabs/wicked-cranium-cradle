import { Component, OnInit } from '@angular/core';
import { TokenService } from '../services/token.service';

export interface PeriodicElement {
  cart: string;
  item: string;
  price: number;
  quantity: number;
  from: string;
  to: string;
  time: number;
  position: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    cart: 'Hydrogen',
    item: '1 Demo Item',
    price: 2500,
    quantity: 20,
    from: 'Demo',
    to: 'Test',
    time: 20,
  },
  {
    position: 2,
    cart: 'Hydrogen',
    item: '1 Demo Item',
    price: 2500,
    quantity: 20,
    from: 'Demo',
    to: 'Test',
    time: 20,
  },
];

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss'],
})
export class TokenComponent implements OnInit {
  nftData: any | undefined = [];

  constructor(public tokenService: TokenService) {
    this.tokenInsite();
  }

  ngOnInit(): void {}

  tokenInsite() {
    this.tokenService.getNftData().then((result) => {
      this.nftData = result;
    });
  }

  displayedColumns: string[] = [
    'position',
    'cart',
    'item',
    'price',
    'quantity',
    'from',
    'to',
    'time',
  ];
  dataSource = ELEMENT_DATA;
}
