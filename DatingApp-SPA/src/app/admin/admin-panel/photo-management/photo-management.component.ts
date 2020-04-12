import { Component, OnInit } from "@angular/core";
import { AdminService } from "src/app/_services/admin.service";
import { AdminApprovalPhotoUser } from "src/app/_models/photo-approval";
import { AlertyfyService } from "src/app/_services/alertyfy.service";

@Component({
  selector: "app-photo-management",
  templateUrl: "./photo-management.component.html",
  styleUrls: ["./photo-management.component.css"],
})
export class PhotoManagementComponent implements OnInit {
  adminPhotoData: AdminApprovalPhotoUser[];
  constructor(
    private adminService: AdminService,
    private alertify: AlertyfyService
  ) {}
  ngOnInit() {
    this.adminService.getPhotoForApproval().subscribe((res) => {
      this.adminPhotoData = res as AdminApprovalPhotoUser[];
    });
  }
  ApproveImage(adminApprovalPhotoUser: AdminApprovalPhotoUser, id: number) {
    this.alertify.confirm(
      "Are you sure do you want to Approve this Image",
      () => {
        this.adminService.ApproveOrRejectPhoto(id, true).subscribe(() => {
          adminApprovalPhotoUser.photos.splice(
            adminApprovalPhotoUser.photos.findIndex((obj) => obj.id === id),
            1
          );
        });
      }
    );
  }
  RejectImage(adminApprovalPhotoUser: AdminApprovalPhotoUser, id: number) {
    this.alertify.confirm(
      "Are you sure do you want to Approve this Image",
      () => {
        this.adminService.ApproveOrRejectPhoto(id, false).subscribe(() => {
          adminApprovalPhotoUser.photos.splice(
            adminApprovalPhotoUser.photos.findIndex((obj) => obj.id === id),
            1
          );
        });
      }
    );
  }
}
