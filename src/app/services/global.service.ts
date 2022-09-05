import firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractService } from './contract.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  constructor(
    public db: AngularFirestore,
    public contractService: ContractService,
    public tokenService: TokenService
  ) {}

  getAddressFromToken = async (tokenId: any) => {
    var address: any = await this.db
      .collection('tokens_to_address')
      .ref.where(
        firebase.firestore.FieldPath.documentId(),
        '==',
        tokenId.toString()
      )
      .get()
      .then(({ docs }) => {
        var ids = docs.map((doc) => {
          var addressData: any = doc.data();
          return addressData.owner;
        });
        return ids[0];
      });
    return address;
  };

  getTokenFromAddress = async (address: string) => {
    var pktotokenid: any = await this.db
      .collection('address_to_tokens')
      .ref.where(firebase.firestore.FieldPath.documentId(), '==', address)
      .get()
      .then(({ docs }) => {
        var ids = docs.map((doc) => {
          var tokens = doc.data();
          return tokens;
        });
        return ids[0];
      });
    return pktotokenid.tokens;
  };

  globalTokensData = async (walletAddr: any): Promise<any> => {
    var globalData: any = await this.getTokenFromAddress(walletAddr);

    const batches: Array<any> = [];
    const collectionPath = this.db.collection('tokenidtodata');

    for (let i = 0; i < globalData.length; i += 10) {
      const tokenData = globalData.slice(i, i + 10);
      
      batches.push(
        collectionPath.ref
          .where(firebase.firestore.FieldPath.documentId(), 'in', tokenData.join().split(','))
          .where('set_as_pfp', '==', true)
          .get()
          .then((results) => results.docs.map((result) => result.data()))
      );
    }
    return Promise.all(batches).then((content: any) => {
      var dataArr: any = content.flat();
      return dataArr[0];
    });
  }

  getDataOtherAddr = async (walletAddr: any): Promise<any> => {
    var globalData: any = await this.getTokenFromAddress(walletAddr);

    if (!globalData || !globalData.length) return [];

    const batches: Array<any> = [];
    const collectionPath = this.db.collection('tokenidtodata');

    for (let i = 0; i < globalData.length; i += 10) {
      const tokenData = globalData.slice(i, i + 10);

      batches.push(
        collectionPath.ref
          .where(firebase.firestore.FieldPath.documentId(), 'in', tokenData.join().split(','))
          .get()
          .then((results) => results.docs.map((result) => result.data()))
      );
    }
      return Promise.all(batches).then((content: any) => {
        var dataArr: any = content.flat();
        return dataArr;
      });
  }

  getCurrentPFP = async (): Promise<any> => {
    const dataObj = this.contractService.getAccoutData();

    if (!dataObj.tokens || !dataObj.tokens.length) return [];

    const batches: Array<any> = [];
    const collectionPath = this.db.collection('tokenidtodata');

    for (let i = 0; i < dataObj.tokens.length; i += 10) {
      const tokenData = dataObj.tokens.slice(i, i + 10);

      batches.push(
        collectionPath.ref
          .where(firebase.firestore.FieldPath.documentId(), 'in', tokenData.join().split(','))
          .where('set_as_pfp', '==', true)
          .get()
          .then((results) => results.docs.map((result) => result.data()))
      );
    }

    return Promise.all(batches).then((content: any) => {
      var pfpTokenArr = content.flat();
      if (pfpTokenArr.length == 0) {
        this.db
          .collection('tokenidtodata')
          .doc(dataObj.tokens[0].toString())
          .update({
            set_as_pfp: true,
          });
        return dataObj.tokens[0];
      } else {
        var idData = pfpTokenArr.map((doc: any) => {
          var tokenData = doc;
          return tokenData;
        });
        var pfpId: any = idData[0];
        return pfpId.id;
      }
    });
  }

  getCurrentProfile = async (): Promise<any> => {
    const dataObj = this.contractService.getAccoutData();

    if (!dataObj.tokens || !dataObj.tokens.length) return [];

    const batches: Array<any> = [];
    const collectionPath = this.db.collection('tokenidtodata');

    for (let i = 0; i < dataObj.tokens.length; i += 10) {
      const tokenData = dataObj.tokens.slice(i, i + 10);

      batches.push(
        collectionPath.ref
          .where(firebase.firestore.FieldPath.documentId(), 'in', tokenData.join().split(','))
          .get()
          .then((results) => results.docs.map((result) => result.data()))
      );
    }

    return Promise.all(batches).then((content: any) => {
      var dataArr: any = content.flat();
      return dataArr;
    });
  }
}
