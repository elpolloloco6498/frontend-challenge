import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";

@Injectable()
export class AuthDataService {
    constructor(private httpClient: HttpClient) {
    }

    getUsersData() {
        return this.httpClient.get("assets/api/users.json").pipe(
            map((data) => Object.values(data))
        )
    }
}