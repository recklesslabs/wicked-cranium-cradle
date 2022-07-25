import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  messageCount: any = 0;
  constructor(private chatService: ChatService) {
    this.chatService.getMsgBadgeCount().subscribe((value: any) => {
      this.messageCount = value;
    });
  }
  ngOnInit(): void {}
}
