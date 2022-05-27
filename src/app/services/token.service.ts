import { Injectable } from '@angular/core';
import Moralis from 'moralis';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  nftData: any | undefined = [];
  constructor() {}

  getNftData = async () => {
    const serverUrl = 'https://twznqwxv4nyi.usemoralis.com:2053/server';
    const appId = '33rnzSWY3AAMHFMEQPVtRxfoFgEy2dK7OQ7WOBTu';

    Moralis.start({ serverUrl, appId });

    const options: any = {
      address: '0x85f740958906b317de6ed79663012859067e745b',
    };

    const NFTTrades = await Moralis.Web3API.token.getNFTTrades(options);
    return NFTTrades.result?.slice(0, 100);
  };
}
