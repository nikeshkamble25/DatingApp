import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AuthService } from "src/app/_services/auth.service";
import { AlertyfyService } from "src/app/_services/alertyfy.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  model: any = {};
  @Input() valueFromHome: any;
  @Output() cancelRegister = new EventEmitter();
  constructor(
    private authService: AuthService,
    private alertify: AlertyfyService
  ) {}
  ngOnInit() {}
  register() {
    this.authService.register(this.model).subscribe(
      () => {
        this.alertify.success("registration success");
        this.cancelRegister.emit(false);
      },
      error => {
        this.alertify.error(error);
        this.cancelRegister.emit(false);
      }
    );
  }
  cancel() {
    this.cancelRegister.emit(false);
  }
}
