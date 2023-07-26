import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as d3 from 'd3';
import { CategoryDataService } from '../services/category/category-data.service';

interface dataPoint {
  date: Date;
  value: number | null;
}

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.css']
})
export class ScatterChartComponent implements OnInit {

  ngOnInit(): void {
    this.refreshGraph()
  }

  constructor(private categoryDataService: CategoryDataService, private formBuilder: FormBuilder) {}

  dateForm = this.formBuilder.group({
    date: new Date("2022-07-21")
  })

  title = 'Scatter chart';
  data: any = []
  currentProductId: number = 250162

  private width = 1400;
  private height = 600;
  private margin = 60;
  private svgOnlineDemand: any;
  private svgAverageSearchVolume: any;

  get maxDate() {
    return this.dateForm.get("date")?.value
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
      .attr("transform", "translate(" + this.margin + "," + 0 + ")");
    
    let x = d3.scaleUtc()
      .domain([new Date("2018-07-01"), new Date(this.maxDate?.toDateString() ?? "2020-07-01")])
      .range([this.margin, this.width - this.margin]);

  // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
      .domain([0, 1.2 * this.maxVolume])
      .range([this.height - this.margin, this.margin]);

    console.log(this.maxDate)
    // axis x
    // this.svgOnlineDemand.append("g")
    // .attr("transform", "translate(0," + (this.height-this.margin) + ")")
    // .call(d3.axisBottom(x));

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
      .attr("x", 600)
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
    
    this.svgOnlineDemand
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", this.width/2+10)
      .attr("y", this.height-8)
      .text("Date");
  }

  drawAverageSearchVolume() {
    // clear svg canvas
    d3.select('figure#averageSearchVolume').selectAll('*').remove();
    // create svg
    this.svgAverageSearchVolume = d3.select("figure#averageSearchVolume")
      .append("svg")
      .attr("width", this.width)
      .attr("height", 240)
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + 0 + ")");
    
    let x = d3.scaleUtc()
      .domain([new Date("2018-07-01"), new Date(this.maxDate?.toDateString() ?? "2020-07-01")])
      .range([this.margin, this.width - this.margin]);

  // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
      .domain([1.2 * this.minAverageSearchVolume, 1.2 * this.maxAverageSearchVolume])
      .range([240 - this.margin, this.margin]);

    // axis x
    this.svgAverageSearchVolume.append("g")
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

