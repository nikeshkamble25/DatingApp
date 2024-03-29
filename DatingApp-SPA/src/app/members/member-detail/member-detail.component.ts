import { Component, OnInit, ViewChild } from "@angular/core";
import { User } from "src/app/_models/user";
import { AlertyfyService } from "src/app/_services/alertyfy.service";
import { UserService } from "src/app/_services/user.service";
import { ActivatedRoute } from "@angular/router";
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryAnimation
} from "ngx-gallery-9";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { PresenceService } from "src/app/_services/presence.service";
import { AuthService } from "src/app/_services/auth.service";

@Component({
  selector: "app-member-detail",
  templateUrl: "./member-detail.component.html",
  styleUrls: ["./member-detail.component.css"]
})
export class MemberDetailComponent implements OnInit {
  @ViewChild("memberTabs", { static: true }) memberTabs: TabsetComponent;
  user: any;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  constructor(
    private route: ActivatedRoute,
    public presence: PresenceService,
    public userService: UserService,
    public authService: AuthService,
  ) {
    this.userService
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data["user"];
    });
    this.route.queryParams.subscribe(params => {
      const selectedTab = params["tab"];
      this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
    });
    this.galleryOptions = [
      {
        width: "500px",
        height: "500px",
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Rotate,
        preview: false
      }
    ];
    this.galleryImages = this.getImages();
  }
  getImages() {
    const imageUrl = [];
    for (const photo of this.user.photos) {
      imageUrl.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url,
        description: photo.description
      });
    }
    return imageUrl;
  }
  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
    if (this.memberTabs.tabs[tabId].heading === "Messages") {
      this.userService.createHubConnection(this.user, this.user.username);
    } else {
      this.userService.stopHubConnection();
    }
  }
  ngOnDestroy(){
    this.userService.stopHubConnection();
  }
}
