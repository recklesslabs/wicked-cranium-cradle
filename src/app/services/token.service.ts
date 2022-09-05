import Moralis from 'moralis';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { mainnetContract } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  nftData: any | undefined = [];
  constructor() {
    const serverUrl = environment.serverUrl;
    const appId = environment.moralisAppId;
    Moralis.start({ serverUrl, appId });
  }

  getNFTTrades = async () => {
    const getNFTTradesOptions: any = {
      address: mainnetContract,
    };
    const NFTTrades = await Moralis.Web3API.token.getNFTTrades(
      getNFTTradesOptions
    );
    return NFTTrades.result?.slice(0, 100);
  };
}
