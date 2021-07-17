import { Injectable } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";
import { User } from "../_models/user";
import { UserService } from "../_services/user.service";
import { AlertyfyService } from "../_services/alertyfy.service";
import { catchError } from "rxjs/operators";
import { of, Observable } from "rxjs";
import { Message } from "../_models/Message";
import { AuthService } from "../_services/auth.service";
import { PaginatedResult } from "../_models/pagination";
@Injectable()
export class MessagesResolver implements Resolve<PaginatedResult<Message[]>> {
  pageNumber = 1;
  pageSize = 5;
  messageContainer = "Unread";
  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertyfyService,
    private authService: AuthService
  ) {}
  resolve(route: ActivatedRouteSnapshot): Observable<PaginatedResult<Message[]>> {
    const returnObject = this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pageNumber,
        this.pageSize,
        this.messageContainer
      )
      .pipe(
        catchError(error => {
          this.alertify.error("Problem retrieving messages");
          this.router.navigate(["/home"]);
          return of(null);
        })
      );
    return returnObject;
  }
}
