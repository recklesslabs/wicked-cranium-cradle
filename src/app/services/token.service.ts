import Moralis from 'moralis';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { mainnetContract, testnetContract } from '../constants';

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

  getAddressFromToken = async (tokenId: number) => {
    const getTokenIdOwnersOptions: any = {
      address: testnetContract,
      token_id: tokenId.toString(),
      chain: 'rinkeby',
    };

    var address: string = '';
    const NFTOwners: any = await Moralis.Web3API.token.getTokenIdOwners(
      getTokenIdOwnersOptions
    );
    NFTOwners.result.map((i: any) => {
      address = i.owner_of;
    });

    return address;
  };

  getTokenFromAddress = async (address: string) => {
    const nftOptions: any = {
      chain: 'rinkeby',
      address: address,
    };
    return await Moralis.Web3API.account.getNFTs(nftOptions);
  };
}
