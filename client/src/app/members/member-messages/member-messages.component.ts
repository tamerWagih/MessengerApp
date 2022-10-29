import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_models/message';
import { MessagesService } from 'src/app/_services/messages.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm: NgForm;
  @Input() messages: Message[] = [];
  @Input() username: string;
  messageContent: string;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(public messageService: MessagesService) {}

  ngOnInit() {}

  sendMessage() {
    this.messageService
      .sendMessage(this.username, this.messageContent)
      .then(() => {
        this.messageForm.reset();
      });
  }
}
