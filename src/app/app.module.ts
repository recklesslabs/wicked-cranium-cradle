import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { EditDialogComponent } from './dialogs/edit-dialog.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { AppRoutingModule } from './app-routing.module';
import { MessageComponent } from './message/message.component';
import { ProfileComponent } from './profile/profile.component';
import { StoriesComponent } from './stories/stories.component';
import { MapComponent } from './map/map.component';
import { SwiperModule } from 'swiper/angular';
import { TradesComponent } from './trades/trades.component';
import { SliderTokenComponent } from './slider-token/slider-token.component';
import { MomentModule } from 'ngx-moment';
import { LoaderComponent } from './loader/loader.component';
import { StoreModule } from '@ngrx/store';
import { AddressReducer } from './store/reducers/address.reducer';
import { environment } from '../environments/environment';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: environment.apiKey,
  authDomain: environment.authDomain,
  projectId: environment.projectId,
  storageBucket: environment.storageBucket,
  messagingSenderId: environment.messagingSenderId,
  appId: environment.appId,
  measurementId: environment.measurementId,
};

@NgModule({
  declarations: [
    AppComponent,
    EditDialogComponent,
    MenuComponent,
    MessageComponent,
    ProfileComponent,
    StoriesComponent,
    MapComponent,
    TradesComponent,
    SliderTokenComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule,
    ScrollingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    FormsModule,
    BrowserAnimationsModule,
    SwiperModule,
    MatCardModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
    AppRoutingModule,
    MatListModule,
    MatGridListModule,
    MatSlideToggleModule,
    GoogleMapsModule,
    MomentModule,
    StoreModule.forRoot({ walletState: AddressReducer }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
