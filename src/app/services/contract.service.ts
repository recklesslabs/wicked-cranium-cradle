import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { AngularFirestore } from '@angular/fire/firestore';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { onConnect } from '../store/actions/address.actions';
import { testnetAbi, testnetContract } from '../constants';
import { environment } from '../../environments/environment';

declare var Web3: any;
declare var window: any;

function initWeb3(provider: any) {
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });

  return web3;
}

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  address$: Observable<any>;
  batch = 10;
  theEnd = false;
  public accountsObservable = new Subject<string[]>();
  web3Modal;
  globalObject: any;
  cipherData: any;
  decryptData: any;
  isLoading = new Subject<boolean>();
  accountTokens = new Subject<object>();
  message = new Subject<string>();

  web3Inst: any;

  constructor(
    public db: AngularFirestore,
    private store: Store<{ walletState: any }>,
    private router: Router
  ) {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: environment.infuraId,
        },
      },
      coinbasewallet: {
        display: {
          description: 'Scan qrcode with your mobile wallet',
        },
        package: CoinbaseWalletSDK,
        options: {
          infuraId: environment.infuraId,
        },
      },
    };

    this.web3Modal = new Web3Modal({
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

    this.rxTokenDataObj();

    if (
      localStorage.getItem('walletData') != null &&
      Object.keys(this.globalObject).length == 0
    ) {
      var walletData: any = localStorage.getItem('walletData');
      var jsonObj: any = JSON.parse(walletData);
      this.store.dispatch(
        onConnect({
          content: this.decryptObj(jsonObj.WCtoken, jsonObj.address),
        })
      );
    }

    if (this.web3Modal.cachedProvider) {
      this.connectAccount();
    }
  }

  getAccoutData() {
    var walletData: any = localStorage.getItem('walletData');
    var jsonObj: any = JSON.parse(walletData);
    var tokenObj = this.decryptObj(jsonObj.WCtoken, jsonObj.address);
    return tokenObj;
  }

  rxTokenDataObj() {
    this.address$ = this.store.select((store: any) => store.walletState); //get data from reducer
    this.address$.subscribe((currentUser) => {
      this.globalObject = currentUser;
    });
    return this.globalObject;
  }

  async connectAccount() {
    try {
      const instance = await this.web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);

      await this.subscribeProvider(instance);
      await instance.enable();

      const web3: any = initWeb3(instance);
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      const networkId = await web3.eth.net.getId();
      const chainId = await web3.eth.chainId();

      this.web3Inst = instance;

      let param = {
        connected: true,
        address: address,
        chainId: chainId,
        networkId: networkId,
        tokens: '',
      };

      this.store.dispatch(onConnect({ content: param })); //sent data to reducer
      return accounts;
    } catch (err) {
      this.message.next('login with metamask!');
    }
  }

  encryptObj(globalObj: any, key: any) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(globalObj),
      key + 'wc'
    ).toString();
  }

  decryptObj(globalObj: any, key: any) {
    try {
      var bytes = CryptoJS.AES.decrypt(globalObj, key + 'wc');
      this.decryptData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return this.decryptData;
    } catch (e) {
      this.handleDisconnect();
    }
  }

  walletEventsFunction = async (
    provider?: any,
    account?: any,
    chainId?: any
  ) => {
    const web3: any = initWeb3(provider);
    const accountsArr = await web3.eth.getAccounts();
    const address = accountsArr[0];
    const networkId = await web3.eth.net.getId();
    const newchainId = await web3.eth.chainId();

    var accountData = this.getAccoutData();

    if (accountData.address == address) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3.utils.toHex(chainId) }],
        });

        this.isLoading.next(true);

        let param = {
          connected: true,
          address: address,
          chainId: chainId,
          networkId: networkId,
          tokens: '',
        };

        this.store.dispatch(onConnect({ content: null }));
        this.store.dispatch(onConnect({ content: param }));

        var getTokensRes = await this.getTokens();
        if (getTokensRes) {
          var tokens = getTokensRes.tokens;

          if (tokens.length > 0) {
            this.accountTokens.next(tokens);

            this.router.navigate(['/profile']).then(() => {
              window.location.reload();
            });
          } else {
            this.router.navigate(['/']).then(() => window.location.reload());
          }
        } else {
          this.router.navigate(['/']).then(() => window.location.reload());
        }

        setTimeout(() => {
          this.isLoading.next(false);
        }, 2000);
      } catch (err: any) {
        console.log(err);
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Polygon Mainnet',
                chainId: web3.utils.toHex(chainId),
                nativeCurrency: {
                  name: 'MATIC',
                  decimals: 18,
                  symbol: 'MATIC',
                },
                rpcUrls: ['https://polygon-rpc.com/'],
              },
            ],
          });
        }
      }
    } else {
      this.isLoading.next(true);
      let param = {
        connected: true,
        address: address,
        chainId: chainId,
        networkId: networkId,
        tokens: '',
      };

      this.store.dispatch(onConnect({ content: null }));
      this.store.dispatch(onConnect({ content: param }));

      var getTokensRes = await this.getTokens();
      if (getTokensRes) {
        var tokens = getTokensRes.tokens;

        if (tokens.length > 0) {
          this.accountTokens.next(tokens);
          this.router.navigate(['/profile']).then(() => {
            window.location.reload();
          });
        } else {
          this.router.navigate(['/']).then(() => window.location.reload());
        }
      } else {
        this.router.navigate(['/']).then(() => window.location.reload());
      }

      setTimeout(() => {
        this.isLoading.next(false);
      }, 2000);
    }
  };

  handleAccountsChanged = async (provider: any, account: object) => {
    if (Object.keys(account).length > 0) {
      this.walletEventsFunction(provider, account, null);
    } else {
      this.handleDisconnect();
    }
  };

  handleChainChanged = async (provider: any, chain: number) => {
    this.walletEventsFunction(provider, null, chain);
  };
  handleDisconnect = async () => {
    this.isLoading.next(true);
    this.web3Modal.clearCachedProvider();
    this.store.dispatch(onConnect({ content: null }));
    localStorage.clear();
    this.router.navigate(['/']).then(() => window.location.reload());
    setTimeout(() => {
      this.isLoading.next(false);
    }, 2000);
  };

  public subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.on('accountsChanged', (account: any) => {
      this.handleAccountsChanged(provider, account);
    });

    provider.on('chainChanged', (chainId: number) => {
      this.handleChainChanged(provider, chainId);
    });

    provider.on('disconnect', () => {
      this.handleDisconnect();
    });
  };

  public getTokens = async (address?: string) => {
    var accounts: any;
    if (address) {
      accounts = address;
    } else {
      accounts = await this.connectAccount();
    }

    localStorage.removeItem('walletData');
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
        var rxTokenDataObj = this.rxTokenDataObj();

        var globalObj = { ...rxTokenDataObj.content, tokens: data };
        var cipherData = this.encryptObj(globalObj, globalObj.address);
        let walletObj: any = {
          address: globalObj.address,
          WCtoken: cipherData,
        };
        localStorage.setItem('walletData', JSON.stringify(walletObj));
        return { tokens: data, pk: walletAddress };
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      return false;
    }
  };

  getTokenImg(offset: any) {
    return this.db
      .collection('tokenidtodata', (ref) =>
        ref.orderBy('id').startAfter(offset).limit(this.batch))
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
