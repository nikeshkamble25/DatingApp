import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../_models/user";
import { PaginatedResult } from "../_models/pagination";
import { map } from "rxjs/operators";
import { Message } from "../_models/Message";
@Injectable({
  providedIn: "root",
})
export class UserService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getUsers(
    page?,
    itemsPerParams?,
    userParams?,
    likesParams?
  ): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<
      User[]
    >();
    let params = new HttpParams();
    if (page != null && itemsPerParams != null) {
      params = params.append("pageNumber", page);
      params = params.append("pageSize", itemsPerParams);
    }
    if (likesParams === "Likers") {
      params = params.append("likers", "true");
    }
    if (likesParams === "Likees") {
      params = params.append("likees", "true");
    }
    if (userParams != null) {
      params = params.append("minAge", userParams.minAge);
      params = params.append("maxAge", userParams.maxAge);
      params = params.append("gender", userParams.gender);
      params = params.append("orderBy", userParams.orderBy);
    }
    return this.http
      .get<User[]>(this.baseUrl + "users", { observe: "response", params })
      .pipe(
        map((response) => {
          paginatedResult.result = response.body;
          if (response.headers.get("Pagination") != null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get("Pagination")
            );
          }
          return paginatedResult;
        })
      );
  }
  getUserForEdit(id): Observable<User> {
    return this.http.get<User>(this.baseUrl + "users/" + id + "/edit");
  }
  getUserForDetail(id): Observable<User> {
    return this.http.get<User>(this.baseUrl + "users/" + id + "/detail");
  }
  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + "users/" + id, user);
  }
  setMainPhoto(userId: number, id: number) {
    return this.http.post(
      this.baseUrl + "users/" + userId + "/photos/" + id + "/setMain",
      {}
    );
  }
  deletePhoto(userId: number, photoId: number) {
    return this.http.delete(
      this.baseUrl + "users/" + userId + "/photos/" + photoId
    );
  }
  sendLike(id: number, recipientId: number) {
    return this.http.post(
      this.baseUrl + "users/" + id + "/like/" + recipientId,
      {}
    );
  }
  getMessages(
    id: number,
    page?,
    itemsPerPage?,
    messageContainer?
  ): Observable<PaginatedResult<Message[]>> {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<
      Message[]
    >();
    let params = new HttpParams();
    params = params.append("MessageContainer", messageContainer);
    if (page != null && itemsPerPage != null) {
      params = params.append("pageNumber", page);
      params = params.append("pageSize", itemsPerPage);
    }
    return this.http
      .get<Message[]>(this.baseUrl + "users/" + id + "/messages", {
        observe: "response",
        params,
      })
      .pipe(
        map((response) => {
          paginatedResult.result = response.body;
          if (response.headers.get("Pagination") !== null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get("Pagination")
            );
          }
          return paginatedResult;
        })
      );
  }

  getMessageThread(id: number, recipientId: number) {
    return this.http.get<Message[]>(
      this.baseUrl + "users/" + id + "/messages/thread/" + recipientId
    );
  }
  sendMessage(id: number, message: Message) {
    return this.http.post(this.baseUrl + "users/" + id + "/messages", message);
  }
  deleteMessage(id: number, userId: number) {
    return this.http.post(
      this.baseUrl + "users/" + userId + "/messages/" + id,
      {}
    );
  }
  markAsRead(userId: number, messageId: number) {
    return this.http
      .post(
        this.baseUrl + "users/" + userId + "/messages/" + messageId + "/read",
        {}
      )
      .subscribe();
  }
}