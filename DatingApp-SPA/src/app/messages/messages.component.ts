import { Component, OnInit } from "@angular/core";
import { Message } from "../_models/Message";
import { Pagination, PaginatedResult } from "../_models/pagination";
import { AlertyfyService } from "../_services/alertyfy.service";
import { UserService } from "../_services/user.service";
import { AuthService } from "../_services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { ConfirmService } from "../_services/confirm.service";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.css"]
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = "Unread";
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private alertify: AlertyfyService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data["messages"].result;
      this.pagination = data["messages"].pagination;
    });
  }
  loadMessages() {
    this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer
      )
      .subscribe(
        (res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        },
        error => { },
        () => { }
      );
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  deleteMessage(id: number) {
    this.confirmService.confirm('Confirm delete message', 'This cannot be undone')
      .subscribe(result => {
        if (result) {
          this.userService
          .deleteMessage(id, this.authService.decodedToken.nameid)
          .subscribe(
            () => {
              this.messages.splice(
                this.messages.findIndex(m => m.id === id),
                1
              );
              this.alertify.success("Message Deleted");
            },
            error => {
              this.alertify.error(error.error);
            }
          );
        }
      });
  }
}
