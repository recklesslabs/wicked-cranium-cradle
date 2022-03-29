import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { database } from 'faker';


@Component({
  selector: 'app-edit-dialog',
  template: `
  <div>
  <div class="home-add-dialog" mat-dialog-content>
    <div class="left-profile animated fadeInDown">
        <div class="img-card" [ngClass]="setAsPfp ? 'rounded-img ' : 'square-img animated flipInX'">          
            <img [src]="
            'https://raw.githubusercontent.com/recklesslabs/wickedcraniums-300x300/main/' +
            data.token.id +
            '.png'
          " alt="img">
        </div>
        <h4>
            Skull #{{data.token.id}}
        </h4>
        <div class="action-slide-toggle">
            <mat-slide-toggle (change)="setAsPfpStatus()" [(ngModel)]="setAsPfp">Set as PFP</mat-slide-toggle>
        </div>
    </div>
  <div class="right-profile">
      <mat-form-field appearance="fill" class="animated fadeInDown">
        <mat-label>What is Their Name?</mat-label>
        <input placeholder="" matInput [(ngModel)]="data.token.name" />
      </mat-form-field>
      <mat-form-field appearance="fill" class="animated fadeInDown">
      <mat-label>What’s the story?</mat-label>
          <textarea rows="6" cols="80" placeholder="" matInput [(ngModel)]="data.token.bio"></textarea>
      </mat-form-field>
      <div class="social-input">
      <mat-form-field appearance="fill" class="animated fadeInDown">
          <mat-label>Drop a Social Twitter Link</mat-label>
          <input placeholder="" matInput [(ngModel)]="data.token.twitter_link" />
          <mat-icon matPrefix class="my-icon"><img src="../../assets/images/twitter.svg" alt="img"></mat-icon>
        </mat-form-field>
        <mat-form-field appearance="fill" class="animated fadeInDown">
          <mat-label>Drop a Social Discord Link</mat-label>
          <input placeholder="" matInput [(ngModel)]="data.token.discord_link" />
          <mat-icon matPrefix class="my-icon"><img src="../../assets/images/discord.svg" alt="img"></mat-icon>
      </mat-form-field>
      </div>
     
      <div class="map-outer animated fadeInDown">
          <div class="action-slide-toggle">
              <mat-slide-toggle (change)="optInLocStatus()" [(ngModel)]="optInLoc">Opt in location</mat-slide-toggle>
          </div>
          
          <div class="map-area" [ngClass]="optInLoc ? 'show-map ' : 'hide-map'">
              <google-map  
                  height="200px"
                  width="100%"
                  [zoom]="zoom"
                  [center]="center"
                   [options]="options"
                   (mapClick)="addLocation($event)">
                      <map-marker #somemarker="mapMarker"
                          *ngFor="let marker of markers"
                          [position]="marker.position"
                          [options]="marker.options"
                          (mapClick)="openInfoWindow(somemarker, marker.info)">
                      </map-marker>
                      <map-info-window #infoWindow="mapInfoWindow"> {{ infoContent }}</map-info-window>
              </google-map>
          </div>
          
      </div>
      <div mat-dialog-actions class="animated fadeInDown">
          <button mat-button (click)="onNoClick()">Cancel</button>
          <button mat-button [mat-dialog-close]="data">LFG!</button>
      </div>
  </div>
</div>
</div>
  `,
  styles: [],
})
export class EditDialogComponent implements OnInit {

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow

  setAsPfp = false;
  optInLoc = false;

  zoom = 2;
  maxZoom = 20;
  minZoom = 2;
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    zoomControl: true,
    gestureHandling: 'cooperative',
    disableDoubleClickZoom: false,
    streetViewControl: false,
    maxZoom: this.maxZoom,
    minZoom: this.minZoom,
    styles: [
      {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [
              {
                  "saturation": 36
              },
              {
                  "color": "#000000"
              },
              {
                  "lightness": 40
              }
          ]
      },
      {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#000000"
              },
              {
                  "lightness": 16
              }
          ]
      },
      {
          "featureType": "all",
          "elementType": "labels.icon",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 20
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 17
              },
              {
                  "weight": 1.2
              }
          ]
      },
      {
          "featureType": "landscape",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 20
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 21
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 17
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 29
              },
              {
                  "weight": 0.2
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 18
              }
          ]
      },
      {
          "featureType": "road.local",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 16
              }
          ]
      },
      {
          "featureType": "transit",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 19
              }
          ]
      },
      {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 17
              }
          ]
      }
  ],
  }

  markers: any = []
  infoContent = ''

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      if(!this.data.token.opt_in_loc){
          this.data.token.opt_in_loc = this.optInLoc;
          this.data.token.location = {lat:0,lng:0};
      }else{
          this.optInLoc = this.data.token.opt_in_loc;
      }
      
      if(!this.data.token.set_as_pfp){
          this.data.token.set_as_pfp = this.setAsPfp;
      }else{
          this.setAsPfp = this.data.token.set_as_pfp;
      }
   }

  ngOnInit(): void {

    // navigator.geolocation.getCurrentPosition((position) => {
    //   this.center = {
    //     lat: 23.0122,
    //     lng: 72.5064,
    //   }
    // })
    
    setTimeout(() => {
      this.addMarker();
    }, 1000);

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public openInfoWindow(marker: MapMarker, content: any) {
    this.infoContent = content;
    this.infoWindow.open(marker);
  }

  addMarker() {

    var latlong = this.data.token.location;
    this.markers.push({
      position: latlong,
      label: {
        color: 'black',
        text: '',
      },
      title: '',
      info: '',
      options: {
        animation: google.maps.Animation.BOUNCE,
        icon: '../assets/images/marker.svg'
      },
    });
    
  }

  addLocation(event: google.maps.MapMouseEvent) {
    this.dialogRef.componentInstance.data.token.location = JSON.parse(JSON.stringify(event.latLng));    
    this.markers = new Array();
    this.addMarker();
  }

  setAsPfpStatus(){
    this.data.token.set_as_pfp = this.setAsPfp;
  }

  optInLocStatus(){
    this.data.token.opt_in_loc = this.optInLoc;
    if(!this.data.token.opt_in_loc){
      this.data.token.location = {lat:0,lng:0};
    }
  }

}
