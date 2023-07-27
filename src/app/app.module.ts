import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectCategoryComponent } from './select-category/select-category.component';
import {MatRadioModule} from '@angular/material/radio';
import { CategoryDataService } from './services/category/category-data.service';
import { RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { AuthService } from './services/auth/auth.service';
import { AuthDataService } from './services/auth/auth-data.service';
import { BannerComponent } from './banner/banner.component';
import {MatMenuModule} from '@angular/material/menu';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SelectCategoryComponent,
    LoginPageComponent,
    BannerComponent,
  ],
  imports: [
    RouterModule.forRoot([
      {path: 'dashboard', component: DashboardComponent},
      {path: 'login', component: LoginPageComponent},
    ]),
    MatTreeModule,
    MatIconModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatRadioModule,
    RouterModule,
    MatMenuModule,
  ],
  providers: [
    CategoryDataService,
    AuthService,
    AuthDataService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
