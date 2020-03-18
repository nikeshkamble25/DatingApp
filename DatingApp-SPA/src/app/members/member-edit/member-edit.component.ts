import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { User } from "src/app/_models/user";
import { ActivatedRoute } from "@angular/router";
import { AlertyfyService } from "src/app/_services/alertyfy.service";
import { NgForm } from "@angular/forms";
import { AuthService } from "src/app/_services/auth.service";
import { UserService } from "src/app/_services/user.service";
import { of } from "rxjs";

@Component({
  selector: "app-member-edit",
  templateUrl: "./member-edit.component.html",
  styleUrls: ["./member-edit.component.css"]
})
export class MemberEditComponent implements OnInit {
  @ViewChild("editForm", { static: true }) editForm: NgForm;
  user: User;
  photoUrl: string;
  @HostListener("window:beforeunload", ["$event"])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }
  constructor(
    private route: ActivatedRoute,
    private alertify: AlertyfyService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data["user"];
    });
    this.authService.currentPhotoUrl.subscribe(
      photoUrl => (this.photoUrl = photoUrl)
    );
  }
  updateUser() {
    const nums = of([1, 2, 3, 4, 5], 1, 2, 3);
    nums.pipe(obj => {
      console.log(obj);
      return of(null);
    });

    this.userService
      .updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(
        next => {
          this.alertify.success("Profile updated successfully");
          this.editForm.reset(this.user);
        },
        error => {
          this.alertify.error(error);
        }
      );
  }
  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }
}
