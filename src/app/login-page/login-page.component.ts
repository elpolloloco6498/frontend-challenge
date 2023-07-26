import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  constructor(private router: Router, private authService: AuthService, private formBuilder: FormBuilder) {}

  loginForm = this.formBuilder.group({
    username: "",
    password: "",
  })

  async checkCredentials() {
    const auth = await this.authService.checkCredentialUser(this.loginForm.value.username ?? "", this.loginForm.value.password ?? "")
    if (auth) {
      this.router.navigate(['dashboard'])
    }
    return false
  }
}
