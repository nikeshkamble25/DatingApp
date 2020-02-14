import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  documentHeight: any;
  constructor() {}
  ngOnInit() {
    this.setWindowHeight(window.innerHeight);
  }
  onResize(event) {
    this.setWindowHeight(event.target.innerHeight);
  }
  setWindowHeight(height: any) {
    if (height > 500) {
      this.documentHeight = height;
    } else {
      this.documentHeight = 500;
    }
  }
}
