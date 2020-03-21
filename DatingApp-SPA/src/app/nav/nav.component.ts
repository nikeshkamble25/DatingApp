import { Component, OnInit } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { AlertyfyService } from "../_services/alertyfy.service";
import { Router } from "@angular/router";

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
    private alertify: AlertyfyService,
    private router: Router
  ) {}
  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(obj => (this.photoUrl = obj));
  }
  login() {
    this.authService.login(this.model).subscribe(
      next => {
        this.alertify.success("Login Success");
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
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.message("Logged out");
    this.router.navigate(["/home"]);
  }
}
