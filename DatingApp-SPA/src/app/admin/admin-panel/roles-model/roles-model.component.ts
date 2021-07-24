import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { User } from "src/app/_models/user";

@Component({
  selector: "app-roles-model",
  templateUrl: "./roles-model.component.html",
  styleUrls: ["./roles-model.component.css"],
})
export class RolesModelComponent implements OnInit {
  @Output() updateSelectedRoles = new EventEmitter();
  user: User;
  title: string;
  closeBtnName: string;
  roles: any[];
  constructor(public bsModalRef: BsModalRef) {}
  ngOnInit() {}
  updateRoles() {
    this.updateSelectedRoles.emit(this.roles);
    this.bsModalRef.hide();
  }
}
