import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-value",
  templateUrl: "./value.component.html",
  styleUrls: ["./value.component.css"]
})
export class ValueComponent implements OnInit {
  valueList: any;
  constructor(private httpClient: HttpClient) {}
  ngOnInit() {
    this.getValues();
  }
  async getValues() {
    // tslint:disable-next-line: no-debugger
    try {
      this.valueList = await this.httpClient
        .get("http://localhost:5000/api/values")
        .toPromise();
    } catch (error) {}
  }
}
