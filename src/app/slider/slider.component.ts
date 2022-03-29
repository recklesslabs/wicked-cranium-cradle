import { Component, OnInit } from '@angular/core';
import { SwiperComponent } from "swiper/angular";

import SwiperCore, { Navigation } from "swiper";

// install Swiper modules
SwiperCore.use([Navigation]);

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
//   template: ` <swiper
//   [slidesPerView]="1"
//   [spaceBetween]="50"
  
// >
//   <ng-template swiperSlide>Slide 1</ng-template>
//   <ng-template swiperSlide>Slide 2</ng-template>
//   <ng-template swiperSlide>Slide 3</ng-template>
//   <ng-template swiperSlide>Slide 4</ng-template>
//   <ng-template swiperSlide>Slide 5</ng-template>
//   <ng-template swiperSlide>Slide 6</ng-template>
//   <ng-template swiperSlide>Slide 7</ng-template>
// </swiper>`,
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
