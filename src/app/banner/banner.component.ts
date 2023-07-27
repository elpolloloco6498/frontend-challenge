import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent {
  @Output() logout: EventEmitter<any> = new EventEmitter();
  @Input() username: string = "";
}
