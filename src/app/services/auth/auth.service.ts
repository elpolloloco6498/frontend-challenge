import { Injectable } from "@angular/core";
import { AuthDataService } from "./auth-data.service";
import { SHA256 } from 'crypto-js';

interface User {
    username: string;
    password: string;
}

function hash(text: string): string {
    return SHA256(text).toString();
}

@Injectable()
export class AuthService {
    constructor(private authDataService: AuthDataService) {
    }

    checkCredentialUser(username: string, password: string): Promise<boolean> {
        return this.authDataService.getUsersData().toPromise().then((users: User[] | undefined) => {
            if (users) {
                const userFound: User | undefined = users.find((data) => data.username === username);
                if (userFound) {
                    const hashPass = hash(password);
                    if (hashPass === userFound.password) {
                        return true;
                    }
                } else {
                    console.log("user not found");
                }
            }
            return false;
        }).catch((error) => {
            console.error("Error fetching users data:", error);
            return false;
        });
    }
}