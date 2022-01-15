import { Injectable } from '@angular/core';
import { mainnetAbi, mainnetContract } from './constants';

declare var Web3: any;
declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor() {}

  public getAccounts = async () => {
    try {
      let acc = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return acc;
    } catch (e) {
      return [];
    }
  };

  public getTokens = async (): Promise<
    | {
        tokens: number[];
        pk: string;
      }
    | false
  > => {
    const accounts = await this.getAccounts();
    if (accounts.length > 0) {
      const walletAddress = accounts[0];
      var web3 = new Web3(Web3.givenProvider);
      window.contract = await new web3.eth.Contract(
        mainnetAbi,
        mainnetContract
      );
      try {
        const res = await window.ethereum.request({
          method: 'eth_call',
          params: [
            {
              to: mainnetContract,
              from: walletAddress,
              data: window.contract.methods
                .balanceOf(walletAddress)
                .encodeABI(),
            },
            'latest',
          ],
        });
        const balance = parseInt(res);
        const promises = [];
        for (let i = 0; i < balance; i++) {
          promises.push(
            parseInt(
              await window.ethereum.request({
                method: 'eth_call',
                params: [
                  {
                    to: mainnetContract,
                    from: walletAddress,
                    data: window.contract.methods
                      .tokenOfOwnerByIndex(walletAddress, i)
                      .encodeABI(),
                  },
                  'latest',
                ],
              })
            )
          );
        }
        const data = await Promise.all(promises);
        return { tokens: data, pk: walletAddress };
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      console.log('WC: no accounts found');
      return false;
    }
  };
}
