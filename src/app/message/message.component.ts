import firebase from 'firebase';
import CRC32 from 'crc-32';
import { debounceTime, map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { ContractService } from '../services/contract.service';
import { GlobalService } from '../services/global.service';
import { TokenService } from '../services/token.service';

export interface Message {
  id: any;
  message: any;
  messageTime: any;
}

export interface SingleUser {
  id: any;
  address: any;
  messageTime: any;
  unreadCount: number;
}

export interface OtherUser {
  id: any;
  address: any;
  messageTime: any;
  unreadCount: number;
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  dbMessages: Message[] | any;
  dbUserName: SingleUser[] | any;
  submitted = false;
  flag: boolean = true;
  selected: any;
  recevier_name: any;
  recevier_pfp: any;
  messageTitle: any;
  unreadCount: any;
  totalMessageCount: any = 0;

  message: any = {
    id: '',
    message: '',
    messageTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  singleUser: any = {
    id: '',
    address: '',
    messageTime: firebase.firestore.FieldValue.serverTimestamp(),
    unreadCount: 0,
  };

  otherUser: any = {
    id: '',
    address: '',
    messageTime: firebase.firestore.FieldValue.serverTimestamp(),
    unreadCount: 0,
  };

  constructor(
    private chatService: ChatService,
    public contractService: ContractService,
    public db: AngularFirestore,
    public globalService: GlobalService,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    private router: Router
  ) {
    this.getAddress();
    this.chatService.getMsgBadgeCount();
    this.getUserName();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.selected = 0;
      }
    });
  }

  getAddress = async () => {
    try {
      var accObj = this.contractService.getAccoutData();
      this.message.id = accObj.address;
      var tokenId: any = this.route.snapshot.paramMap.get('token');
      let urlTokenAdd = await this.globalService.getAddressFromToken(tokenId);
      this.getChats(this.message.id, urlTokenAdd);
    } catch (e) { }
  };

  ngOnInit(): void {}

  isActive(item: any) {
    return this.selected === item;
  }

  getChats = (senderAddress: string, receiverAddress: string) => {
    this.chatService.chat(senderAddress, receiverAddress);
    this.singleUser.id = CRC32.str(receiverAddress);
    this.singleUser.address = receiverAddress;
    this.otherUser.id = CRC32.str(senderAddress);
    this.otherUser.address = senderAddress;
    this.flag = false;
    this.selected = receiverAddress;
    this.getMessages();
    this.messageTitle = this.dbUserName.find(
      (x: any) => x.address == receiverAddress
    );
    this.recevier_name = this.messageTitle.name;
    this.recevier_pfp = this.messageTitle.id;
  };

  getMessages() {
    this.totalMessageCount = 0;
    this.chatService
      .getAllMessages()
      .snapshotChanges()
      .pipe(
        debounceTime(800),
        map((changes: any) =>
          changes.map((c: any) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe(async (data: any[]) => {
        var pfpToken = await Promise.all(
          data.map(async (obj: any) => {
            const { id: receiver_id } = obj;
            return {
              ...obj,
              ...(await this.chatService.UserData(obj.id)),
              receiver_id: receiver_id,
            };
          })
        );
        this.dbMessages = pfpToken;
        if (this.selected) {
          this.resetUnreadCount(
            this.otherUser.id.toString(),
            this.selected.toString()
          );
        }
      });
  }

  getUserName() {
    this.chatService
      .getOtherUser()
      .snapshotChanges()
      .pipe(
        debounceTime(1000),
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
            if (this.selected && obj.unreadCount > 0) {
              this.resetUnreadCount(
                this.otherUser.id.toString(),
                this.selected.toString()
              );
            }
            const { id: receiver_id } = obj;
            return {
              ...obj,
              ...(await this.chatService.UserData(obj.address)),
              receiver_id: receiver_id,
            };
          })
        );
        this.dbUserName = pfpTokenData;
      });
  }

  resetUnreadCount(senderAdd: string, receiverAddress: string) {
    this.db
      .collection(senderAdd)
      .ref.where('address', '==', receiverAddress)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          this.db.collection(senderAdd).doc(doc.id.toString()).update({
            unreadCount: 0,
          });
        });
      });
  }

  setUnreadCount(senderAdd: string, receiverAddress: string) {
    this.db
      .collection(senderAdd)
      .ref.where('address', '==', receiverAddress)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          var docDataObj: any = doc.data();
          this.db
            .collection(senderAdd)
            .doc(doc.id.toString())
            .update({
              unreadCount: docDataObj.unreadCount + 1,
            });
        });
      });
  }

  openProfile = async (tokenId: string) => {
    var TokenAddress = await this.globalService.getAddressFromToken(tokenId);
    this.router.navigate(['/', 'profile', tokenId, TokenAddress]);
  };

  saveUserMessage(): void {
    this.setUnreadCount(
      CRC32.str(this.singleUser.address).toString(),
      this.otherUser.address.toString()
    );

    this.chatService.createMessage(this.message).then(() => {
      this.submitted = true;
      this.message.message = '';
    });

    var isUserHere: boolean = false;
    this.dbUserName.map((db: any) => {
      if (db.address == this.singleUser.address) {
        isUserHere = true;
      }
    });
    if (!isUserHere) {
      this.chatService.createUser(this.singleUser);
      this.chatService.createOtherUser(this.otherUser);
    }
  }

  restrictSpace(event: any) {
    if (event.target.selectionStart === 0 && event.code === 'Space') {
      event.preventDefault();
    }
  }
}
