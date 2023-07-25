import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";

@Injectable()
export class CategoryDataService {
    constructor(private httpClient: HttpClient) {

    }

    getCategory(id: number) {
        return this.httpClient.get(`assets/api/volumes/${id}.json`).pipe(
            map((data) => {
                const dataArray = Object.values(data);
                return dataArray.map(elt => ({date: new Date(elt.date), volume: elt.volume}))
            })
        )
    }

    getCategories() {
        return this.httpClient.get("assets/api/categories.json").pipe(
            map((data) => Object.values(data))
        )
    }
}