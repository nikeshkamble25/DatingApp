import { Component, OnInit } from "@angular/core";
import { AuthService } from "../_services/auth.service";
import { AlertyfyService } from "../_services/alertyfy.service";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.css"]
})
export class NavComponent implements OnInit {
  model: any = {};
  constructor(
    public authService: AuthService,
    private alertify: AlertyfyService
  ) {}
  ngOnInit() {}
  login() {
    this.authService.login(this.model).subscribe(
      next => {
        this.alertify.success("Login Success");
      },
      error => {
        this.alertify.error("Error");
      }
    );
  }
  loggedIn() {
    return this.authService.loggedIn();
  }
  logOut() {
    localStorage.removeItem("token");
    this.alertify.message("Logged out");
  }
}
