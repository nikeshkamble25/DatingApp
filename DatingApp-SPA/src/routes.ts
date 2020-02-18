import { Routes } from "@angular/router";
import { HomeComponent } from "./app/home/home.component";
import { MemberListComponent } from "./app/member-list/member-list.component";
import { MessagesComponent } from "./app/messages/messages.component";
import { ListsComponent } from "./app/lists/lists.component";
import { AuthGuard } from "./app/_guards/auth.guard";
import { AuthService } from "./app/_services/auth.service";

export const appRoutes: Routes = [
  { path: "home", component: HomeComponent , pathMatch: "full"},
  {
    path: "",
    runGuardsAndResolvers: "always",
    canActivate: [AuthGuard],
    children: [
      { path: "members", component: MemberListComponent },
      { path: "messages", component: MessagesComponent },
      { path: "lists", component: ListsComponent }
    ]
  },
  { path: "**", redirectTo: "home", pathMatch: "full" }
];
