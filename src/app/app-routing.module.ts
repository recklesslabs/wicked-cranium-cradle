import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessageComponent } from './message/message.component';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MapComponent } from './map/map.component';
import { SliderComponent } from './slider/slider.component';
import { TokenComponent } from './token/token.component';
import { AuthService } from './services/auth.service';
import { AuthGuardGuard } from './auth/auth-guard.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'message',
    component: MessageComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'slider',
    component: SliderComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'token',
    component: TokenComponent,
    canActivate: [AuthGuardGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthService],
})
export class AppRoutingModule {}
