import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app.component';
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
import { LinkDialogComponent } from './dialogs/link-dialog.component';
import { MenuComponent } from './menu/menu.component';
import { AppRoutingModule } from './app-routing.module';
import { MessageComponent } from './message/message.component';
import { HomeComponent } from './home/home.component';
import { StoriesComponent } from './stories/stories.component';
import { MapComponent } from './map/map.component';
import { SwiperModule } from 'swiper/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { TokenComponent } from './token/token.component';
import { SliderTokenComponent } from './slider-token/slider-token.component';
import { MomentModule } from 'ngx-moment';
import { ImageDialogComponent } from './dialogs/image-dialog/image-dialog.component';
import { LoaderComponent } from './loader/loader.component';
import { StoreModule } from '@ngrx/store';
import { AddressReducer } from './store/reducers/address.reducer';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDbrLIaFZomlneiEN1YM7wYrEaTHUPbdVU',
  authDomain: 'wicked-cranium-cradle-testnet.firebaseapp.com',
  projectId: 'wicked-cranium-cradle-testnet',
  storageBucket: 'wicked-cranium-cradle-testnet.appspot.com',
  messagingSenderId: '663270172205',
  appId: '1:663270172205:web:8cccbcd3813fbd9c413aa4',
  measurementId: 'G-VX5S4D5QW0',
};

@NgModule({
  declarations: [
    AppComponent,
    EditDialogComponent,
    LinkDialogComponent,
    MenuComponent,
    MessageComponent,
    HomeComponent,
    StoriesComponent,
    MapComponent,
    TokenComponent,
    SliderTokenComponent,
    ImageDialogComponent,
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
export class AppModule { }
