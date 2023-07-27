import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as d3 from 'd3';
import { CategoryDataService } from '../services/category/category-data.service';
import { ActivatedRoute, Router } from '@angular/router';

interface dataPoint {
  date: Date;
  value: number | null;
}

interface StateDashboard {
  currentProductId: number;
  startDate: Date | undefined | null;
  endDate: Date | undefined | null;
}

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  ngOnInit(): void {
    this.getState()
    // load all preset from the user
    this.refreshGraph()
  }

  constructor(private categoryDataService: CategoryDataService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) {
    // get user data from router params
    this.sessionUser = this.route.snapshot.queryParamMap.get("username") ?? "Guest"
  }

  getState() {
    try {
      const state: StateDashboard = JSON.parse(localStorage.getItem(this.sessionUser) ?? "")
      this.currentProductId = state.currentProductId
      this.dateForm.setValue({
        startDateInput: new Date(state.startDate ?? "2018-07-21") ?? new Date("2018-07-21"),
        endDateInput: new Date(state.endDate ?? "2022-07-21") ?? new Date("2022-07-21")
      })
    } catch(error) {
      console.log(error)
    }
  }

  saveState() {
    // save all dashboard preset
    const currentState: StateDashboard = {
      currentProductId: this.currentProductId,
      startDate: this.startDate,
      endDate: this.endDate,
    }
    localStorage.setItem(this.sessionUser, JSON.stringify(currentState));
  }

  logout() {
    this.saveState()
    // redirect to login page
    this.router.navigate(["login"])
  }

  sessionUser = ""

  dateForm = this.formBuilder.group({
    startDateInput: new Date("2018-07-21"),
    endDateInput: new Date("2022-07-21")
  })

  title = 'Scatter chart';
  data: any = []
  currentProductId: number = 250162

  // graph variables
  private width = 1300;
  private height = 720;
  private marginY = 40;
  private marginX = 0;
  private marginLeft = 60;
  // svg references
  private svgOnlineDemand: any;

  get startDate(): Date {
    return this.dateForm.get("startDateInput")?.value ?? new Date("2018-07-21")
  }

  get endDate(): Date {
    return this.dateForm.get("endDateInput")?.value ?? new Date("2022-07-21")
  }

  refreshGraph() {
    this.categoryDataService.getCategory(this.currentProductId)
    .subscribe((data) => {
      this.data = data
      this.drawCharts();
    });
  }

  changeProduct(productId: number) {
    this.currentProductId = productId;
    this.refreshGraph()
  }

  get maxVolume() {
    return Math.max(...this.data.map((item: dataPoint) => item.value))
  }

  get minVolume() {
    return Math.min(...this.data.map((item: dataPoint) => item.value))
  }

  averageSearchVolumeWithinDates(startDate: Date, endDate: Date): number {
    const points: dataPoint[] = this.data.filter((item: dataPoint) => item.date >= startDate && item.date <= endDate)
    return points ? Math.round(points.reduce((acc, curr) => acc + (curr.value ?? 0), 0) / points.length) : 0
  }

  get averageSearchVolume() {
    return this.averageSearchVolumeWithinDates(this.startDate, this.endDate)
  }

  get variationAverageSearchVolume() {
    const startDate = this.startDate ? new Date(this.startDate.getFullYear()-1, this.startDate.getMonth(), this.startDate.getDay()) : new Date("2018-07-21")
    const endDate = this.endDate ? new Date(this.endDate.getFullYear()-1, this.endDate.getMonth(), this.endDate.getDay()) : new Date("2022-07-21")
    const averageSearchVolumePreviousYear = this.averageSearchVolumeWithinDates(startDate, endDate);
    return Math.round((this.averageSearchVolume-averageSearchVolumePreviousYear)/averageSearchVolumePreviousYear * 100)
  }

  drawCharts() {
    this.drawOnlineDemand()
  } 

  drawOnlineDemand() {  
    // clear svg canvas
    d3.select('figure#onlineDemand').selectAll('*').remove();
    // create svg
    this.svgOnlineDemand = d3.select("figure#onlineDemand")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", "translate(" + this.marginLeft + "," + 0 + ")");
    
    let x = d3.scaleUtc()
      .domain([new Date(this.startDate?.toDateString() ?? "2018-07-01"), new Date(this.endDate?.toDateString() ?? "2022-07-01")])
      .range([this.marginX, this.width - this.marginX]);

  // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
      .domain([0.9 * this.minVolume, 1.1 * this.maxVolume])
      .range([this.height - this.marginY, this.marginY]);

    // axis x
    this.svgOnlineDemand.append("g")
    .attr("transform", "translate(0," + (this.height-this.marginY) + ")")
    .call(d3.axisBottom(x));

    // axis y
    this.svgOnlineDemand.append("g")
    .call(d3.axisLeft(y));

    // Add dots
    const dots = this.svgOnlineDemand.append('g');
    dots.selectAll("dot")
    .data(this.data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => x(d.date))
    .attr("cy",  (d: any) => y(d.value))
    .attr("r", 4)

    // add lines
    this.svgOnlineDemand.append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x((d: any) => x(d.date))
        .y((d: any) => y(d.value))
      )
    
    this.svgOnlineDemand
      .append("text")
      .attr("x", 700)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Online demand of product")
      .style("font-size", 22)
      .style("font-family", "Calibri")

    this.svgOnlineDemand
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Online demand (volume)");
  }
}

