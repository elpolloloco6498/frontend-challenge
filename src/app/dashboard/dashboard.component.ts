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
  private height = 640;
  private heightAverageSearchVolumeGraph = 220;
  private marginY = 40;
  private marginX = 0;
  private marginLeft = 60;
  // svg references
  private svgOnlineDemand: any;
  private svgAverageSearchVolume: any;

  get startDate() {
    return this.dateForm.get("startDateInput")?.value
  }

  get endDate() {
    return this.dateForm.get("endDateInput")?.value
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

  get minAverageSearchVolume() {
    return Math.min(...this.averageSearchVolume
      .map((item: dataPoint) => item.value ?? 0)
    )
  }

  get maxAverageSearchVolume() {
    return Math.max(...this.averageSearchVolume
      .map((item: dataPoint) => item.value ?? 0)
    )
  }

  get averageSearchVolume() {
    let T = 12; // data point frequency is monthly
    let dataPoints: dataPoint[] = []
    for (let i = 0; i < this.data.length; i++) {
      if (i >= T) {
        const pt: dataPoint = {
          date: this.data[i].date,
          value: (this.data[i].value-this.data[i-T].value)/this.data[i-T].value
        }
        dataPoints.push(pt)
      }
    }
    return dataPoints
  }

  drawCharts() {
    this.drawOnlineDemand()
    this.drawAverageSearchVolume()
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

  drawAverageSearchVolume() {
    // clear svg canvas
    d3.select('figure#averageSearchVolume').selectAll('*').remove();
    // create svg
    this.svgAverageSearchVolume = d3.select("figure#averageSearchVolume")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.heightAverageSearchVolumeGraph)
      .append("g")
      .attr("transform", "translate(" + this.marginLeft + "," + 0 + ")");
    
    let x = d3.scaleUtc()
    .domain([new Date(this.startDate?.toDateString() ?? "2018-07-01"), new Date(this.endDate?.toDateString() ?? "2022-07-01")])
    .range([this.marginX, this.width - this.marginX]);

  // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
      .domain([0.9 * this.minAverageSearchVolume, 1.1 * this.maxAverageSearchVolume])
      .range([this.heightAverageSearchVolumeGraph - this.marginY, this.marginY]);

    // axis x
    this.svgAverageSearchVolume.append("g")
    .attr("transform", "translate(0," + (this.heightAverageSearchVolumeGraph-this.marginY) + ")")
    .call(d3.axisBottom(x));

    // axis y
    this.svgAverageSearchVolume.append("g")
    .call(d3.axisLeft(y));

    // add lines
    this.svgAverageSearchVolume.append("path")
      .datum(this.averageSearchVolume.filter(d => d.value !== null))
      .attr("fill", "none")
      .attr("stroke", "lightblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x((d: any) => x(d.date))
        .y((d: any) => y(d.value))
      )
    
    this.svgAverageSearchVolume
      .append("text")
      .attr("x", 700)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Average search volume (yearly)")
      .style("font-size", 16)
      .style("font-family", "Calibri")

    this.svgAverageSearchVolume
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Average search volume");
    
    this.svgAverageSearchVolume
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", this.width/2+10)
      .attr("y", this.height-8)
      .text("Date");
  }
}

