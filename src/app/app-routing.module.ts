import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessageComponent } from './message/message.component';
import { ProfileComponent } from './profile/profile.component';
import { MapComponent } from './map/map.component';
import { TradesComponent } from './trades/trades.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { StoriesComponent } from './stories/stories.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile/:token/:tokenAddr',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'messages',
    component: MessageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'messages/:token',
    component: MessageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'map/:token',
    component: MapComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'trades',
    component: TradesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'stories',
    component: StoriesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthService],
})
export class AppRoutingModule {}
