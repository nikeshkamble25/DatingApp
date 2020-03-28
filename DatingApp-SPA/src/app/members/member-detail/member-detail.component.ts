import { Component, OnInit, ViewChild } from "@angular/core";
import { User } from "src/app/_models/user";
import { AlertyfyService } from "src/app/_services/alertyfy.service";
import { UserService } from "src/app/_services/user.service";
import { ActivatedRoute } from "@angular/router";
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryAnimation
} from "ngx-gallery";
import { TabsetComponent } from "ngx-bootstrap";

@Component({
  selector: "app-member-detail",
  templateUrl: "./member-detail.component.html",
  styleUrls: ["./member-detail.component.css"]
})
export class MemberDetailComponent implements OnInit {
  @ViewChild("memberTabs", { static: true }) memberTabs: TabsetComponent;
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  constructor(
    private userService: UserService,
    private alertify: AlertyfyService,
    private route: ActivatedRoute
  ) {}

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
    // this.userService.getUser(+this.route.snapshot.params["id"]).subscribe(
    //   (user: User) => {
    //     this.user = user;
    //   },
    //   error => {
    //     this.alertify.error(error);
    //   }
    // );
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
  }
}
