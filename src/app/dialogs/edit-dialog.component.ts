import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';
import { AngularFirestore } from '@angular/fire/firestore';

interface ITokenState {
  id: any;
  name: string;
  bio: string;
  twitter_link: string;
  discord_link: string;
  set_as_pfp: boolean;
  opt_in_loc: boolean;
  location: any;
  address: string;
}
const INITIAL_STATE: ITokenState = {
  id: '',
  name: '',
  bio: '',
  twitter_link: '',
  discord_link: '',
  set_as_pfp: false,
  opt_in_loc: false,
  location: 0,
  address: '',
};

@Component({
  selector: 'app-edit-dialog',
  template: `
    <div>
      <div class="home-add-dialog" mat-dialog-content>
        <div class="left-profile animated fadeInDown">
          <div
            class="img-card"
            [ngClass]="
              setAsPfp ? 'rounded-img ' : 'square-img animated flipInX'
            "
          >
            <img
              [src]="
                'https://raw.githubusercontent.com/recklesslabs/wickedcraniums-300x300/main/' +
                data.token.id +
                '.png'
              "
              alt="img"
            />
          </div>
          <h4>Skull #{{ data.token.id }}</h4>
          <div class="action-slide-toggle">
            <mat-slide-toggle (change)="setAsPfpStatus()" [(ngModel)]="setAsPfp"
              >Set as PFP</mat-slide-toggle
            >
          </div>
        </div>
        <div class="right-profile">
          <mat-form-field appearance="fill" class="animated fadeInDown">
            <mat-label>What is Their Name?</mat-label>
            <input placeholder="" matInput [(ngModel)]="data.token.name" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="animated fadeInDown">
            <mat-label>What’s the story?</mat-label>
            <textarea
              rows="6"
              cols="80"
              placeholder=""
              matInput
              [(ngModel)]="data.token.bio"
            ></textarea>
          </mat-form-field>
          <div class="social-input">
            <mat-form-field appearance="fill" class="animated fadeInDown">
              <mat-label>Drop a Social Twitter Link</mat-label>
              <input
                placeholder=""
                matInput
                [(ngModel)]="data.token.twitter_link"
              />
              <mat-icon matPrefix class="my-icon"
                ><img src="../../assets/images/twitter.svg" alt="img"
              /></mat-icon>
            </mat-form-field>
            <mat-form-field appearance="fill" class="animated fadeInDown">
              <mat-label>Drop a Social Discord Link</mat-label>
              <input
                placeholder=""
                matInput
                [(ngModel)]="data.token.discord_link"
              />
              <mat-icon matPrefix class="my-icon"
                ><img src="../../assets/images/discord.svg" alt="img"
              /></mat-icon>
            </mat-form-field>
          </div>

          <div class="map-outer animated fadeInDown">
            <div class="action-slide-toggle">
              <mat-slide-toggle
                (change)="optInLocStatus()"
                [(ngModel)]="optInLoc"
                >Opt in location</mat-slide-toggle
              >
            </div>

            <div
              class="map-area"
              [ngClass]="optInLoc ? 'show-map ' : 'hide-map'"
            >
            <div #mapContainer1 id="map1" style="height: 200px;width: 100%;"></div>
             
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
export class EditDialogComponent implements AfterViewInit {
  public tokenState: ITokenState;

  @ViewChild("mapContainer1", { static: false }) gmap: ElementRef;
  map: google.maps.Map;

  lat = 0.026843;
  lng = -4.635703;

  NEW_ZEALAND_BOUNDS = {
    north: 85.0,
    south: -85.0,
    west: -180.0,
    east: 180.0,
  };

  coordinates = new google.maps.LatLng(this.lat, this.lng);

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    mapTypeId: 'roadmap',
    zoom: 3,
    maxZoom: 6,
    minZoom: 3,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: false,
    fullscreenControl: false,

    restriction: {
      latLngBounds: {
        north: 64.2,
        south: -64.3,
        west: -84.9,
        east: 84.2,
      },
      strictBounds: false,
    },
  };

  setAsPfp = false;
  optInLoc = false;

  tokenData: any = [];
  tokenLocation: any = [];
  marker: any;

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    public db: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.tokenState = {
      ...INITIAL_STATE,
    };

    this.tokenState.id = data.token.id;

    this.db
      .collection('tokenidtodata')
      .ref.where('id', '==', data.token.id)
      .get()
      .then((res) => {
        if (res.docs.length == 0) {
          data.token = this.tokenState;
        } else {
          res.docs.forEach((doc) => {
            data.token = doc.data();
          });
        }
        this.setAsPfp = data.token.set_as_pfp;
        this.optInLoc = data.token.opt_in_loc;
        this.tokenLocation = data.token.location;

        this.loadAllMarkers(data.token.location);
      });

  }

  ngAfterViewInit(): void {
    this.mapInitializer();

  }

  USGSOverlay = class extends google.maps.OverlayView {
    private bounds: google.maps.LatLngBounds;
    private image: string;
    private div?: HTMLElement;

    constructor(bounds: google.maps.LatLngBounds, image: string) {
      super();

      this.bounds = bounds;
      this.image = image;
    }

    onAdd() {
      this.div = document.createElement('div');
      this.div.classList.add("chintan");
      this.div.style.borderStyle = '0px solid red';
      this.div.style.borderWidth = '1px';
      this.div.style.position = 'absolute';

      const img = document.createElement('img');

      img.src = this.image;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.position = 'absolute';
      this.div.appendChild(img);

      const panes = this.getPanes()!;
      panes.overlayLayer.appendChild(this.div);
    }

    draw() {
      const overlayProjection = this.getProjection();

      const sw = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getSouthWest()
      )!;
      const ne = overlayProjection.fromLatLngToDivPixel(
        this.bounds.getNorthEast()
      )!;

      if (this.div) {
        this.div.style.left = sw.x + 'px';
        this.div.style.top = ne.y + 'px';
        this.div.style.width = ne.x - sw.x + 'px';
        this.div.style.height = sw.y - ne.y + 'px';
      }
    }
  }

  mapInitializer(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);

    this.marker = new google.maps.Marker({
      position: null,
      map: this.map,
      icon: '../assets/images/marker.svg',
      title: "",
      draggable: true,
    });

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-180.000000, -85.000000),
      new google.maps.LatLng(180.000000, 85.000000)
    );

    let image = '../../assets/images/WC_Map_6.svg';

    const overlay = new this.USGSOverlay(bounds, image);
    overlay.setMap(this.map);

    this.map.addListener("click", (event: any) => {

      this.dialogRef.componentInstance.data.token.location = JSON.parse(
        JSON.stringify(event.latLng)
      );

      this.marker.setPosition(this.dialogRef.componentInstance.data.token.location);

    });


    this.marker.addListener("dragend", (event: any) => {
      this.dialogRef.componentInstance.data.token.location = JSON.parse(
        JSON.stringify(event.latLng)
      );

      this.marker.setPosition(this.dialogRef.componentInstance.data.token.location);
    });

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  loadAllMarkers(location?: any): void {
    this.marker.setPosition(location);
  }

  setAsPfpStatus() {
    this.data.token.set_as_pfp = this.setAsPfp;
  }

  optInLocStatus() {
    this.data.token.opt_in_loc = this.optInLoc;
    if (!this.data.token.opt_in_loc) {
      this.data.token.location = 0;
    }
  }
}
