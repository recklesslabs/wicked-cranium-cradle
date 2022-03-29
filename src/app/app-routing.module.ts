import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { MessageComponent } from './message/message.component';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MapComponent } from './map/map.component';
import { SliderComponent } from './slider/slider.component';
import { TokenComponent } from './token/token.component';

const routes: Routes = [
  // { path: 'menu', component: MenuComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'message', component: MessageComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'map', component: MapComponent },
  { path: 'slider', component: SliderComponent },
  { path: 'token', component: TokenComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }