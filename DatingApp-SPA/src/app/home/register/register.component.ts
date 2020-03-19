import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AuthService } from "src/app/_services/auth.service";
import { AlertyfyService } from "src/app/_services/alertyfy.service";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from "@angular/forms";
import { BsDatepickerConfig } from "ngx-bootstrap";
import { User } from "src/app/_models/user";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  user: User;
  @Input() valueFromHome: any;
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private authService: AuthService,
    private alertify: AlertyfyService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  ngOnInit() {
    // this.registerForm = new FormGroup(
    //   {
    //     username: new FormControl("", Validators.required),
    //     password: new FormControl("", [
    //       Validators.required,
    //       Validators.minLength(4),
    //       Validators.maxLength(8)
    //     ]),
    //     confirmPassword: new FormControl("", [
    //       Validators.required,
    //       Validators.minLength(4),
    //       Validators.maxLength(20)
    //     ])
    //   },
    //   this.passwordMatchValidator
    // );
    this.bsConfig = {
      containerClass: "theme-red"
    };
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        gender: ["male"],
        username: ["", Validators.required],
        knownAs: ["", Validators.required],
        dateOfBirth: [null, Validators.required],
        city: ["", Validators.required],
        country: ["", Validators.required],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ],
        confirmPassword: [
          "",
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get("password").value === g.get("confirmPassword").value
      ? null
      : { mismatch: true };
  }

  register() {
    // this.authService.register(this.model).subscribe(
    //   () => {
    //     this.alertify.success("registration success");
    //     this.cancelRegister.emit(false);
    //   },
    //   error => {
    //     this.alertify.error(error);
    //     this.cancelRegister.emit(false);
    //   }
    // );
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      this.authService.register(this.user).subscribe(
        () => {
          this.alertify.success("Registration successful");
          this.authService.login(this.user).subscribe(() => {
            this.router.navigate(["/members"]);
          });
        },
        error => {
          this.alertify.error(error.error);
        }
      );
    }
  }
  cancel() {
    this.cancelRegister.emit(false);
  }
}
