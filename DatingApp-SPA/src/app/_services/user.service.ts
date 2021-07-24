import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "../_models/user";
import { Group } from "../_models/group";
import { PaginatedResult } from "../_models/pagination";
import { map, take } from "rxjs/operators";
import { Message, MessageR } from "../_models/Message";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
@Injectable({
  providedIn: "root",
})
export class UserService {
  private hubConnection: HubConnection
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  messageThread$ = this.messageThreadSource.asObservable();;

  constructor(private http: HttpClient) { }
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
  async sendMessage(message: MessageR) {
    return this.hubConnection.invoke('SendMessage',
      {
        SenderId: message.SenderId,
        RecipientId: message.RecipientId,
        Content: message.Content
      }
    ).catch(error => console.log(error));
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
  createHubConnection(user: User, othrUserName: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + othrUserName, {
        accessTokenFactory: () => localStorage.getItem("token")
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .catch(error => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThreadSource.next(messages);
    });
    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe(messages => {
        this.messageThreadSource.next([message, ...messages])
      });
    });
    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.connections.some(x => x.username === othrUserName)) {
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(message => {
                if(!message.dateRead){
                  message.dateRead = new Date(Date.now())
                }
          });
          this.messageThreadSource.next([...messages]);
        });
      }
    })
  }
  stopHubConnection() {
    if (this.hubConnection)
      this.hubConnection.stop()
        .catch(error => console.log(error));
  }
}
