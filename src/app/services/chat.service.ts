import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import CRC32 from 'crc-32';

export interface Users {
  id: string;
  message: string;
  messageTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  userAddOne: any = '';
  userAddTwo: any = '';
  DbRef: any;
  arrAdd: Array<string> = [];

  constructor(private db: AngularFirestore) {
    this.userAddOne = CRC32.str('0xEDB33Bb89dEFE621F3765EbA582999eEfA26974e');
    this.userAddTwo = CRC32.str('0xc70776427469B2E8c3839BF84e2fE481fB5AE2de');
    this.arrAdd = [this.userAddOne, this.userAddTwo].sort();
    this.DbRef = db.collection(this.arrAdd[0] + '_' + this.arrAdd[1], (ref) =>
      ref.orderBy('messageTime', 'desc')
    );
  }

  chat(ad1: string, ad2: string): any {
    this.userAddOne = CRC32.str(ad1);
    this.userAddTwo = CRC32.str(ad2);
    this.arrAdd = [this.userAddOne, this.userAddTwo].sort();
    this.DbRef = this.db.collection(
      this.arrAdd[0] + '_' + this.arrAdd[1],
      (ref) => ref.orderBy('messageTime', 'desc')
    );
  }

  getAll(): any {
    return this.DbRef;
  }

  create(users: Users): any {
    return this.DbRef.add({ ...users });
  }
}
