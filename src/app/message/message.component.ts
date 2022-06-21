import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ChatService } from '../services/chat.service';
import { ContractService } from '../services/contract.service';
import firebase from 'firebase';
import CRC32 from 'crc-32';
import { AngularFirestore } from '@angular/fire/firestore';
import { GlobleService } from '../services/globle.service';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from '../services/token.service';

export interface Users {
  id: any;
  message: any;
  messageTime: any;
}

export interface SingleUser {
  id: any;
  receiver_add: any;
  messageTime: any;
}

export interface OtherUser {
  id: any;
  sender_add: any;
  messageTime: any;
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  dbUsers: Users[] | any;
  dbUserName: SingleUser[] | any;
  submitted = false;
  tokens: number[] = [];
  secPerson: string = '';
  flag: boolean = true;
  selected: any;
  user: any = {
    id: '',
    message: '',
    messageTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  singleUser: any = {
    id: '',
    receiver_add: '',
    messageTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  otherUser: any = {
    id: '',
    sender_add: '',
    messageTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  constructor(
    private chatService: ChatService,
    public contractService: ContractService,
    public db: AngularFirestore,
    public globleService: GlobleService,
    private route: ActivatedRoute,
    public tokenService: TokenService
  ) {
    this.getMessages();
    this.getAddress();
  }

  getAddress = async () => {
    var accObj = this.contractService.getAccoutData();
    this.user.id = accObj.address;
    this.getUserName();
    let urlToken = this.route.snapshot.queryParams.token;
    let urlTokenAdd = await this.tokenService.getAddressFromToken(urlToken);
    console.log(urlTokenAdd)
    this.getChats(this.user.id, urlTokenAdd);
  };

  ngOnInit(): void { }

  isActive(item: any) {
    return this.selected === item;
  }

  getChats = async (senderAddress: any, receiverAddress: any) => {
    await this.chatService.chat(senderAddress, receiverAddress);
    this.singleUser.id = CRC32.str(receiverAddress);
    this.singleUser.receiver_add = receiverAddress.toLowerCase();
    this.otherUser.id = CRC32.str(senderAddress);
    this.otherUser.sender_add = senderAddress.toLowerCase();
    this.secPerson = receiverAddress;
    this.flag = false;
    this.selected = receiverAddress;
    this.getMessages();
    this.getUserName();
    this.UserData(receiverAddress);
  };

  async UserData(walletAddr: any) {
    var pfpTokenData = await this.globleService.globalTokensData(walletAddr);
    return pfpTokenData;
  }

  getMessages() {
    this.chatService
      .getAllMessages()
      .snapshotChanges()
      .pipe(
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data: object) => {
        this.dbUsers = data;
      });
  }

  getUserName() {
    this.chatService
      .getOtherUser()
      .snapshotChanges()
      .pipe(
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe(async (data: object) => {
        this.dbUserName = data;
        var pfpTokenData = await Promise.all(
          this.dbUserName.map(async (obj: any) => {
            const { id: receiver_id } = obj;
            return {
              ...obj,
              ...(await this.UserData(obj.receiver_add.toLowerCase())),
              receiver_id: receiver_id,
            };
          })
        );
        this.dbUserName = pfpTokenData;
        console.log(this.dbUserName)
      });
  }

  saveUserMessage(): void {
    this.chatService.createMessage(this.user).then(() => {
      this.submitted = true;
      this.user.message = '';
    });

    var isUserHere: boolean = false;
    this.dbUserName.map((db: any) => {
      if (db.receiver_id == this.singleUser.id) {
        isUserHere = true;
      }
    });
    if (!isUserHere) {
      this.chatService.createUser(this.singleUser);
    }
    this.chatService.createOtherUser(this.otherUser);
  }
}
