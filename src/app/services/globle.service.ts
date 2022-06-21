import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { ContractService } from './contract.service';
import Moralis from 'moralis';

@Injectable({
  providedIn: 'root',
})
export class GlobleService {
  dbPosts: any;
  pktotokenid: any;
  constructor(
    public db: AngularFirestore,
    public contractService: ContractService
  ) {
  }

  /** * Get tokens form firebase  */
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

  /** *  Get token (who has pfp true) data from firebase  */
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
}
