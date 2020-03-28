import { Component, OnInit, Input } from "@angular/core";
import { UserService } from "src/app/_services/user.service";
import { AuthService } from "src/app/_services/auth.service";
import { AlertyfyService } from "src/app/_services/alertyfy.service";
import { Message } from "src/app/_models/Message";
import { tap } from "rxjs/operators";

@Component({
  selector: "app-member-message",
  templateUrl: "./member-message.component.html",
  styleUrls: ["./member-message.component.css"]
})
export class MemberMessageComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private alertify: AlertyfyService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }
  loadMessages() {
    const currentUserId = +this.authService.decodedToken.nameid;
    this.userService
      .getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
      .pipe(
        tap(messages => {
          for (let index = 0; index < messages.length; index++) {
            const message = messages[index];
            if (
              message.isRead === false &&
              message.recipientId === currentUserId
            ) {
              this.userService.markAsRead(currentUserId, message.id);
            }
          }
        })
      )
      .subscribe(m => {
        this.messages = m;
      });
  }
  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.userService
      .sendMessage(this.authService.decodedToken.nameid, this.newMessage)
      .subscribe(
        (message: Message) => {
          this.messages.unshift(message);
          this.newMessage.content = "";
        },
        error => {
          this.alertify.error(error.error);
        }
      );
  }
}
