import { Injectable } from '@angular/core';
import Moralis from 'moralis';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  nftData: any | undefined = [];
  constructor() {
    const serverUrl = 'https://sfgsvtgyp5uc.usemoralis.com:2053/server';        // client's
    const appId = 'pQX2NP30kEs5rehM59txrExaTd7ps52aDk35LgRh';

    Moralis.start({ serverUrl, appId });
  }

  getNftData = async () => {
    const getNFTTradesOptions: any = {
      address: '0x85f740958906b317de6ed79663012859067e745b', // Contract address(mainnet)
    };

    const NFTTrades = await Moralis.Web3API.token.getNFTTrades(
      getNFTTradesOptions
    );

    return NFTTrades.result?.slice(0, 100);
  };

  getAddressFromToken = async (tokenId: number) => {
    const getTokenIdOwnersOptions: any = {
      address: '0x75d42ec0b5a8d023c27c400902ce363a9093e419',
      token_id: tokenId,
      chain: 'rinkeby',
    };

    var address: string = '';

    const NFTOwners: any = await Moralis.Web3API.token.getTokenIdOwners(getTokenIdOwnersOptions);

    NFTOwners.result.map((i: any) => {
      address = i.owner_of;
    });

    return address;
  };
}
