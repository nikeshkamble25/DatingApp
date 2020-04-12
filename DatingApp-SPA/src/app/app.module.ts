import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG
} from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HammerGestureConfig } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import {
  BsDropdownModule,
  TabsModule,
  BsDatepickerModule,
  PaginationModule,
  ButtonsModule,
  ModalModule,
  AccordionModule
} from "ngx-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { JwtModule } from "@auth0/angular-jwt";
import { NgxGalleryModule } from "ngx-gallery";
import { FileUploadModule } from "ng2-file-upload";
import { TimeagoModule } from 'ngx-timeago';

import { ErrorInterceptorProvider } from "./_services/error.interceptor";

import { AppComponent } from "./app.component";
import { NavComponent } from "./nav/nav.component";
import { HomeComponent } from "./home/home.component";
import { RegisterComponent } from "./home/register/register.component";
import { LoginComponent } from "./login/login.component";
import { MemberListComponent } from "./members/member-list/member-list.component";
import { ListsComponent } from "./lists/lists.component";
import { MessagesComponent } from "./messages/messages.component";
import { MemberCardComponent } from "./members/member-card/member-card.component";
import { MemberDetailComponent } from "./members/member-detail/member-detail.component";
import { MemberEditComponent } from "./members/member-edit/member-edit.component";
import { MemberMessageComponent } from './members/member-message/member-message.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { PhotoEditorComponent } from "./members/photo-editor/photo-editor.component";
import { UserManagementComponent } from './admin/admin-panel/user-management/user-management.component';
import { PhotoManagementComponent } from './admin/admin-panel/photo-management/photo-management.component';
import { RolesModelComponent } from './admin/admin-panel/roles-model/roles-model.component';

import { AuthGuard } from "./_guards/auth.guard";
import { appRoutes } from "src/routes";
import { MemberDetailResolver } from "./_resolver/member-detail.resolver";
import { MemberListResolver } from "./_resolver/member-list.resolver";
import { MemberEditResolver } from "./_resolver/member-edit.resolver";
import { ListsResolver } from "./_resolver/list.resolver";
import { MessagesResolver } from "./_resolver/messages.resolver";
import { HasRoleDirective } from './_directives/has-role.directive';

export function tokenGetter() {
  return localStorage.getItem("token");
}

export class CustomHammerConfig extends HammerGestureConfig {
  override = {
    pinch: { enable: false },
    rotate: { enable: false }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    MemberListComponent,
    ListsComponent,
    MessagesComponent,
    MemberCardComponent,
    MemberDetailComponent,
    MemberEditComponent,
    PhotoEditorComponent,
    MemberMessageComponent,
    AdminPanelComponent,
    HasRoleDirective,
    UserManagementComponent,
    PhotoManagementComponent,
    RolesModelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ["localhost:5000"],
        blacklistedRoutes: ["localhost:5000/auth"]
      }
    }),
    NgxGalleryModule,
    FileUploadModule,
    ReactiveFormsModule,
    ButtonsModule.forRoot(),
    TimeagoModule.forRoot()
  ],
  providers: [
    MemberDetailResolver,
    MemberListResolver,
    MemberEditResolver,
    ListsResolver,
    MessagesResolver,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: CustomHammerConfig
    }
  ],
  entryComponents:[
    RolesModelComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
