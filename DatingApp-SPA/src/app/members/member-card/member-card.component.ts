import { Component, OnInit, Input } from "@angular/core";
import { User } from "src/app/_models/user";
import { AlertyfyService } from "src/app/_services/alertyfy.service";
import { AuthService } from "src/app/_services/auth.service";
import { UserService } from "src/app/_services/user.service";

@Component({
  selector: "app-member-card",
  templateUrl: "./member-card.component.html",
  styleUrls: ["./member-card.component.css"]
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;
  liked: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertify: AlertyfyService
  ) {}

  ngOnInit() {
    this.liked = this.user.liked;
  }
  sendLike(id: number) {
    this.userService
      .sendLike(this.authService.decodedToken.nameid, id)
      .subscribe(
        data => {
          this.liked = !this.liked;
        },
        error => {
          this.alertify.error(error.error);
        }
      );
  }
}
