import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider'; // this profile wallet handler
import { ethers } from 'ethers';
import { testnetAbi, testnetContract } from '../constants';
import { map, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { onConnect } from '../store/actions/address.actions';
import CryptoJS from 'crypto-js';
import { Router } from '@angular/router';

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
    var tokenObj = this.decryptObj(
      jsonObj.WCtoken,
      jsonObj.address
    );
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
      this.logout();
    }
  }

  logout() {
    localStorage.clear();
  }

  handleAccountsChanged = async (provider: any, account: object) => {

    if (Object.keys(account).length > 0) {

      this.isLoading.next(true);

      const web3: any = initWeb3(provider);
      const accountsArr = await web3.eth.getAccounts();
      const address = accountsArr[0];
      const networkId = await web3.eth.net.getId();
      const chainId = await web3.eth.chainId();

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
          this.router
            .navigateByUrl('/', { skipLocationChange: false })
            .then(() => this.router.navigate(['/home']));
        } else {
          this.router.navigate(['/']).then(() => window.location.reload());
        }
      } else {
        this.router.navigate(['/']).then(() => window.location.reload());
      }

      this.isLoading.next(false);
    } else {
      this.handleDisconnect(provider);
    }

  };

  handleChainChanged = async (provider: any) => {
    this.isLoading.next(true);

    const web3: any = initWeb3(provider);
    const accountsArr = await web3.eth.getAccounts();
    const address = accountsArr[0];
    const networkId = await web3.eth.net.getId();
    const chain = await web3.eth.chainId();

    let param = {
      connected: true,
      address: address,
      chainId: chain,
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
        this.router
          .navigateByUrl('/', { skipLocationChange: false })
          .then(() => this.router.navigate(['/home']));
      } else {
        this.router.navigate(['/']).then(() => window.location.reload());
      }
    } else {
      this.router.navigate(['/']).then(() => window.location.reload());
    }
    this.isLoading.next(false);

  }
  handleDisconnect = async (provider: any) => {
    this.isLoading.next(true);
    this.web3Modal.clearCachedProvider();
    this.store.dispatch(onConnect({ content: null }));
    localStorage.clear();
    this.router.navigate(['/']).then(() => window.location.reload());
    this.isLoading.next(false);
  }

  public subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.on('accountsChanged', (account: any) => {
      this.handleAccountsChanged(provider, account);
    });

    provider.on('chainChanged', () => {
      this.handleChainChanged(provider);
    });

    provider.on('disconnect', () => {
      this.handleDisconnect(provider);
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
        testnetContract,
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
