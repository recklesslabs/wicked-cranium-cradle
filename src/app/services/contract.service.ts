import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider'; // this profile wallet handler

import { ethers } from 'ethers';
import { testnetAbi, testnetContract } from '../constants';
import { map, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

declare var Web3: any;
declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  batch = 10;
  theEnd = false;
  public accountsObservable = new Subject<string[]>();
  web3Modal;

  constructor(public db: AngularFirestore) {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: 'c37015d1cf314796a9deb27aecf601d8',
        },
      },
    };

    this.web3Modal = new Web3Modal({
      network: 'rinkeby',
      cacheProvider: true,
      providerOptions,
      theme: {
        background: 'rgb(39, 49, 56)',
        main: 'rgb(199, 199, 199)',
        secondary: 'rgb(136, 136, 136)',
        border: 'rgba(195, 195, 195, 0.14)',
        hover: 'rgb(16, 26, 32)',
      },
    });
  }

  async connectAccount() {
    this.web3Modal.clearCachedProvider();

    const instance = await this.web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    // const signer = provider.getSigner();
    const accounts = await provider.listAccounts();
    return accounts;
  }

  public getTokens = async (): Promise<
    | {
        tokens: number[];
        pk: string;
      }
    | false
  > => {
    const accounts = await this.connectAccount();
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

  getTokenImg(offset: any) {
    return this.db
      .collection('tokenidtodata', (ref) =>
        ref.orderBy('id').startAfter(offset).limit(this.batch)
      )
      .snapshotChanges()
      .pipe(
        tap((arr) => (arr.length ? null : (this.theEnd = true))),
        map((arr) => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const data = cur.payload.doc.data();
            const res = { ...acc, [id]: data };
            return res;
          }, {});
        })
      );
  }
}
