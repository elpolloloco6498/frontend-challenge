import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as d3 from 'd3';
import { map } from 'rxjs';

interface dataPoint {
  date: string;
  volume: number;
}


@Component({
  selector: 'app-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.css']
})
export class ScatterChartComponent implements OnInit {

  ngOnInit(): void {
    console.log("Test")
    this.httpClient.get("assets/250162.json").pipe(
      map((data) => {
        const dataArray = Object.values(data);
        return dataArray.map(elt => ({date: new Date(elt.date), volume: elt.volume}))
      })
    )
    .subscribe((data) => {
      this.data = data
      console.log(this.data)
      this.drawChart();
    });
  }

  constructor(private httpClient: HttpClient, private formBuilder: FormBuilder) {}

  dateForm = this.formBuilder.group({
    date: new Date("2022-07-21")
  })

  title = 'Scatter chart';
  data: any = []

  private width = 800;
  private height = 800;
  private margin = 40;
  private svg: any;

  get maxDate() {
    return this.dateForm.get("date")?.value
  }

  // Declare the x (horizontal position) scale.
  

  private createSvg() {
    this.svg = d3.select("figure#scatter")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + 0 + ")");
  }

  drawChart() {
    // clear svg canvas
    d3.select('figure#scatter').selectAll('*').remove();
    // create svg
    this.createSvg()
    
    let x = d3.scaleUtc()
      .domain([new Date("2018-07-01"), new Date(this.maxDate?.toDateString() ?? "2020-07-01")])
      .range([this.margin, this.width - this.margin]);

  // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
      .domain([0, 8000000])
      .range([this.height - this.margin, this.margin]);

    console.log(this.maxDate)
    // axis x
    this.svg.append("g")
    .attr("transform", "translate(0," + (this.height-this.margin) + ")")
    .call(d3.axisBottom(x));

    // axis y
    this.svg.append("g")
    .call(d3.axisLeft(y));

    // Add dots
    const dots = this.svg.append('g');
    dots.selectAll("dot")
    .data(this.data)
    .enter()
    .append("circle")
    .attr("cx", (d: any) => x(d.date))
    .attr("cy",  (d: any) => y(d.volume))
    .attr("r", 4)

    // add lines
    this.svg.append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x((d: any) => x(d.date))
        .y((d: any) => y(d.volume))
      )
  }

}
