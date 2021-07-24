import { Component, OnInit } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { AlertyfyService } from "../_services/alertyfy.service";
import { Router } from "@angular/router";
import { PresenceService } from "../_services/presence.service";
import { UserService } from "../_services/user.service";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.css"]
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;

  constructor(
    public authService: AuthService,
    public userService: UserService,
    private alertify: AlertyfyService,
    private router: Router,
    private presence: PresenceService
  ) {}
  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(obj => (this.photoUrl = obj));
  }
  login() {
    this.authService.login(this.model).subscribe(
      next => {
        this.alertify.success("Login Success");
        this.presence.createHubConnection();
      },
      error => {
        this.alertify.error("Please enter valid username and password");
      },
      () => {
        this.router.navigate(["/members"]);
      }
    );
  }
  loggedIn() {
    return this.authService.loggedIn();
  }
  logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.presence.stopHubConnection();
    this.userService.stopHubConnection();
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.message("Logged out");
    this.router.navigate(["/home"]);
  }
}
