import { ethers } from 'ethers';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { testnetAbi, testnetContract } from '../constants';

declare var Web3: any;
declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  title = 'virtual-scroll';

  constructor(public db: AngularFirestore) {}

  async getLoggedIn() {
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    var accounts = await provider.listAccounts();

    return accounts;
  }

  public setTokens = async (): Promise<
    | {
        tokens: number[];
        pk: string;
      }
    | false
  > => {
    const accounts = await this.getLoggedIn();

    if (accounts.length > 0) {
      const walletAddress = accounts[0];
      var web3 = new Web3(Web3.givenProvider);
      window.contract = await new web3.eth.Contract(
        testnetAbi,
        testnetContract
      );
      try {
        const res = await window.ethereum.request({
          method: 'eth_call',
          params: [
            {
              to: testnetContract,
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
                    to: testnetContract,
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
