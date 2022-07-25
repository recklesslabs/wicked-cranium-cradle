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
  ) {
  }

  /** * Get tokens form firebase (Temp)*/
  async globalTokens(walletAddr: any): Promise<any> {
    var pktotokenid = await this.db
      .collection('pktotokenid')
      .ref.where(firebase.firestore.FieldPath.documentId(), '==', walletAddr)
      .get()
      .then(({ docs }) => {
        var ids = docs.map((doc) => {
          var tokens = doc.data();
          return tokens;
        });
        return ids[0];
      });
    return pktotokenid;
  }

  /** *  Get token (who has pfp true) data from firebase  (Temp) */
  async globalTokensData(walletAddr: any): Promise<any> {
    var globalData = await this.globalTokens(walletAddr);
    return await this.db
      .collection('tokenidtodata')
      .ref.where(
        firebase.firestore.FieldPath.documentId(),
        'in',
        globalData.tokenIds.join().split(',') // compare array to array (Doc id and a simple array)
      )
      .where('set_as_pfp', '==', true)
      .get()
      .then(({ docs }) => {
        var idData = docs.map((doc) => {
          var tokenData = doc.data();
          return tokenData;
        });
        return idData[0];
      });
  }

  /** *  Get token data from firebase  (Temp) */
  async getDataOtherAddr(walletAddr: any): Promise<any> {
    var globalData = await this.globalTokens(walletAddr);
    return await this.db
      .collection('tokenidtodata')
      .ref.where(
        firebase.firestore.FieldPath.documentId(),
        'in',
        globalData.tokenIds.join().split(',') // compare array to array (Doc id and a simple array)
      )
      .get()
      .then(({ docs }) => {
        var idData = docs.map((doc) => {
          var tokenData = doc.data();
          return tokenData;
        });
        return idData;
      });
  }

  /** * set default pfp  */
  async getCurrentPFP(): Promise<any> {
    var defaultPfp = await this.contractService.getAccoutData();
    return await this.db
      .collection('tokenidtodata')
      .ref.where(
        firebase.firestore.FieldPath.documentId(),
        'in',
        defaultPfp.tokens.join().split(',')
      )
      .where('set_as_pfp', '==', true)
      .get()
      .then(({ docs }) => {
        if (docs.length == 0) {
          this.db
            .collection('tokenidtodata')
            .doc(defaultPfp.tokens[0].toString())
            .update({
              set_as_pfp: true,
            });
          return defaultPfp.tokens[0];
        } else {
          var idData = docs.map((doc) => {
            var tokenData = doc.data();
            return tokenData;
          });
          var pfpId: any = idData[0];
          return pfpId.id;
        }
      });
  }

  async getCurrentProfile(): Promise<any> {
    const dataObj = this.contractService.getAccoutData();
    return await this.db
      .collection('tokenidtodata')
      .ref.where(
        firebase.firestore.FieldPath.documentId(),
        'in',
        dataObj.tokens.join().split(',')
      )
      .get()
      .then(({ docs }) => {
        var idData = docs.map((doc) => {
          var tokenData = doc.data();
          return tokenData;
        });
        return idData;
      });
  }

  async getGlobalProfile(address: any) {
    var otherUserTokens: any = await this.tokenService.getTokenFromAddress(address);
    var tokenArr: any[] = [];
    otherUserTokens.result.map((t: any) => {
      tokenArr.push(t.token_id);
    });
    return await this.db
      .collection('tokenidtodata')
      .ref.where(
        firebase.firestore.FieldPath.documentId(),
        'in',
        tokenArr.join().split(',')
      )
      .get()
      .then(({ docs }) => {
        var otherTokenData = docs.map((doc) => {
          var tokenData = doc.data();
          return tokenData;
        });
        return otherTokenData;
      });
  }
}
