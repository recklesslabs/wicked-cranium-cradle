import CRC32 from 'crc-32';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContractService } from './contract.service';
import { GlobalService } from './global.service';

export interface Message {
  id: string;
  message: string;
  messageTime: string;
}

export interface SingleUser {
  id: any;
  messageTime: any;
  recevier_add: any;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  DbRef: any;
  DbRefUser: any;
  DbRefOtherUser: any;
  arrAdd: Array<string> = [];
  msgCount = new Subject<any>();

  constructor(
    private db: AngularFirestore,
    public contractService: ContractService,
    public globalService: GlobalService
  ) {
    var accObj = this.contractService.getAccoutData();
    this.chat(accObj.address, '');
    this.getMsgBadgeCount();
  }

  chat(senderAddress: string, receiverAddress: string): any {
    var senderAddr: any = CRC32.str(senderAddress.toLowerCase());
    var receiverAddr: any = CRC32.str(receiverAddress.toLowerCase());
    this.arrAdd = [senderAddr, receiverAddr].sort();
    this.DbRef = this.db.collection(
      this.arrAdd[0] + '_' + this.arrAdd[1],
      (ref) => ref.orderBy('messageTime', 'desc')
    );
    this.DbRefUser = this.db.collection(senderAddr.toString());
    this.DbRefOtherUser = this.db.collection(receiverAddr.toString());
  }

  getAllMessages(): any {
    return this.DbRef;
  }

  getOtherUser(): any {
    return this.DbRefUser;
  }

  createMessage(message: Message): any {
    return this.DbRef.add({ ...message });
  }

  createUser(singleUser: SingleUser) {
    return this.DbRefUser.add({ ...singleUser });
  }

  createOtherUser(singleUser: SingleUser) {
    return this.DbRefOtherUser.add({ ...singleUser });
  }

  async UserData(walletAddr: string) {
    var pfpTokenData = await this.globalService.globalTokensData(walletAddr);
    // var pfpTokenArr = await this.globalService.getGlobalProfile(walletAddr);
    // var pfpTokenData: any = pfpTokenArr.find((x: any) => x.set_as_pfp == true);
    return pfpTokenData;
  }

  getMsgBadgeCount() {
    this.getOtherUser()
      .snapshotChanges()
      .pipe(
        debounceTime(200),
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe(async (data: any[]) => {
        var pfpTokenData = await Promise.all(
          data.map(async (obj: any) => {
            const { id: receiver_id } = obj;
            return {
              ...obj,
              ...(await this.UserData(obj.address.toLowerCase())),
              receiver_id: receiver_id,
            };
          })
        );
        let tempCount: any = 0;
        this.msgCount.next(tempCount);
        pfpTokenData.map((c: any) => {
          if (c.unreadCount !== 0) {
            tempCount = tempCount + c.unreadCount;
            this.msgCount.next(tempCount);
          }
        });
      });
    return this.msgCount;
  }
}
