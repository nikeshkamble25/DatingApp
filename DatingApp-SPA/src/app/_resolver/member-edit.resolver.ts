import { Injectable } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";
import { User } from "../_models/user";
import { UserService } from "../_services/user.service";
import { AlertyfyService } from "../_services/alertyfy.service";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { AuthService } from "../_services/auth.service";
@Injectable()
export class MemberEditResolver implements Resolve<User> {
  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private alertify: AlertyfyService
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.userService.getUserForEdit(this.authService.decodedToken.nameid).pipe(
      catchError(error => {
        this.alertify.error("Problem retrieving data");
        this.router.navigate(["/members"]);
        return of(null);
      })
    );
  }
}
