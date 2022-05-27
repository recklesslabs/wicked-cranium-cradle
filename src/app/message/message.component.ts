import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import firebase from 'firebase';

export interface Users {
  id: any;
  message: any;
  messageTime: any;
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  dbUsers: Users[] | any;
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

  constructor(
    private chatService: ChatService,
    public authService: AuthService
  ) {
    this.getAll();
    this.getAddress();
  }

  getAddress = async () => {
    var account = await this.authService.getLoggedIn();
    this.user.id = account[0];
  };

  ngOnInit(): void {}

  isActive(item: any) {
    return this.selected === item;
  }

  getChats = (senderAddress: any, receiverAddress: any) => {
    this.chatService.chat(senderAddress, receiverAddress);
    this.secPerson = receiverAddress;
    this.flag = false;
    this.selected = receiverAddress;
    this.getAll();
  };

  getAll() {
    this.chatService
      .getAll()
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

  saveUserMessage(): void {
    this.chatService.create(this.user).then(() => {
      this.submitted = true;
      this.user.message = '';
    });
  }
}
