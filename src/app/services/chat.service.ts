import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import CRC32 from 'crc-32';
import { ContractService } from './contract.service';

export interface Users {
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
  userAddOne: any = '';
  userAddTwo: any = '';
  DbRef: any;
  DbRefUser: any;
  DbRefOtherUser: any;
  arrAdd: Array<string> = [];

  constructor(
    private db: AngularFirestore,
    public contractService: ContractService
  ) {
    var accObj = this.contractService.getAccoutData();
    this.chat(accObj.address, '');
  }

  chat(ad1: string, ad2: string): any {
    this.userAddOne = CRC32.str(ad1.toLowerCase());
    this.userAddTwo = CRC32.str(ad2.toLowerCase());
    this.arrAdd = [this.userAddOne, this.userAddTwo].sort();
    this.DbRef = this.db.collection(
      this.arrAdd[0] + '_' + this.arrAdd[1],
      (ref) => ref.orderBy('messageTime', 'desc')
    );
    this.DbRefUser = this.db.collection(this.userAddOne.toString());
    this.DbRefOtherUser = this.db.collection(
      this.userAddTwo.toString() + ' Other'
    );
  }

  getAllMessages(): any {
    return this.DbRef;
  }

  getOtherUser(): any {
    return this.DbRefUser;
  }

  createMessage(users: Users): any {
    return this.DbRef.add({ ...users });
  }

  createUser(singleUser: SingleUser) {
    return this.DbRefUser.add({ ...singleUser });
  }

  createOtherUser(singleUser: SingleUser) {
    return this.DbRefOtherUser.add({ ...singleUser });
  }
}
