import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ScatterChartComponent } from './scatter-chart/scatter-chart.component';
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


@NgModule({
  declarations: [
    AppComponent,
    ScatterChartComponent,
    SelectCategoryComponent,
  ],
  imports: [
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
  ],
  providers: [
    CategoryDataService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
