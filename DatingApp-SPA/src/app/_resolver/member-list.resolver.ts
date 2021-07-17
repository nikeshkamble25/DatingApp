import { Injectable } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";
import { User } from "../_models/user";
import { UserService } from "../_services/user.service";
import { AlertyfyService } from "../_services/alertyfy.service";
import { catchError } from "rxjs/operators";
import { of, Observable } from "rxjs";
import { PaginatedResult } from "../_models/pagination";
@Injectable()
export class MemberListResolver implements Resolve<PaginatedResult<User[]>> {
  pageNumber = 1;
  pageSize = 12;
  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertyfyService
  ) {}
  resolve(route: ActivatedRouteSnapshot): Observable<PaginatedResult<User[]>> {
    const returnObject = this.userService
      .getUsers(this.pageNumber, this.pageSize)
      .pipe(
        catchError(error => {
          this.alertify.error("Problem retrieving data");
          this.router.navigate(["/home"]);
          return of(null);
        })
      );
    return returnObject;
  }
}
