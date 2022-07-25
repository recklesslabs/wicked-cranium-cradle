import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) gmap: ElementRef;
  map: google.maps.Map;

  lat = 0.026843;
  lng = -4.635703;

  marker: any;

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

  constructor(
    public db: AngularFirestore,
    public globalService: GlobalService,
    private route: ActivatedRoute
  ) {}

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
  };

  mapInitializer(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);

    this.marker = new google.maps.Marker({
      position: null,
      map: this.map,
      icon: '../assets/images/marker.svg',
      title: '',
      draggable: true,
    });

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-180.0, -85.0),
      new google.maps.LatLng(180.0, 85.0)
    );

    let image = '../../assets/images/WC_Map_6.svg';

    const overlay = new this.USGSOverlay(bounds, image);
    overlay.setMap(this.map);

    this.loadAllMarkers();
  }

  async loadAllMarkers() {
    var data = await this.getTokenData();
    var currentProfilesData = await this.globalService.getCurrentProfile();
    // Get address from token and pass with map
    var tokenAddress = '';
    var marker: Array<any> = [];
    data.map(async (markerInfo: any, index) => {
      var isCurrentToken = currentProfilesData.findIndex(
        (x: any) => x.id === markerInfo.id
      );

      //Creating a new marker object
      var myLatlng = new google.maps.LatLng(
        markerInfo.location.lat,
        markerInfo.location.lng
      );

      marker[index] = new google.maps.Marker({
        position: myLatlng,
        map: this.map,
        title: markerInfo.name,
        icon: '../assets/images/marker.svg',
      });

      if (isCurrentToken != -1) {
        marker[index].set('draggable', true);
      }

      marker[index].addListener('dragend', (event: any) => {
        var location = JSON.parse(JSON.stringify(event.latLng));
        this.updateTokenPosition(location, markerInfo.id);
      });

      var content = '';
      if (isCurrentToken == -1) {
        content +=
          '<div id="iw-container" class="other-cranium" style="margin-bottom: 10px;">';
      } else {
        content +=
          '<div id="iw-container" class="own-cranium" style="margin-bottom: 10px;">';
      }
      content +=
        '<div class="iw-title" style="font-size: 22px;font-weight: 400;padding: 10px;background-color: #48b5e9;color: white;margin: 0;border-radius: 2px 2px 0 0;">' +
        '<img class="map-user-img" src="https://raw.githubusercontent.com/recklesslabs/wickedcraniums-300x300/main/' +
        markerInfo.id +
        '.png"/>' +
        marker[index].getTitle() +
        '</div><div class="iw-content" style="font-size: 13px;line-height: 18px;font-weight: 400;margin-right: 1px;padding: 15px 5px 20px 15px;max-height: 140px;overflow-y: auto;overflow-x: hidden;font-size: 16px;color:#000000;">';

      if (isCurrentToken == -1) {
        content +=
          '<a href="/messages/' +
          markerInfo.id +
          '" routerLinkActive="active" ariaCurrentWhenActive="page"><img src="../assets/images/message-ic-gray.svg" class="map-chat-img" /> Chat with ' +
          markerInfo.name +
          '</a>';
      }

      content += '</div>';

      marker[index].infowindow = new google.maps.InfoWindow({
        content: content,
      });

      //Add click event to open info window on marker
      marker[index].addListener('click', () => {
        for (var i = 0; i < marker.length; i++) {
          marker[i].infowindow.close();
        }
        marker[index].infowindow.open(marker[index].getMap(), marker[index]);
      });

      var tokenId: any = this.route.snapshot.paramMap.get('token');
      if (this.route.snapshot.paramMap.get('token')) {
        if (markerInfo.id == tokenId) {
          marker[index].infowindow.open(marker[index].getMap(), marker[index]);
        }
      }

      //Adding marker to google map
      marker[index].setMap(this.map);
    });
  }

  updateTokenPosition(location: any, tokenId: any) {
    this.db
      .collection('tokenidtodata', (ref) => ref.where('id', '==', tokenId))
      .doc(tokenId.toString())
      .update({
        location: location,
      });
  }

  async getTokenData() {
    return await this.db
      .collection('tokenidtodata')
      .ref.where('location', '!=', 0)
      .get()
      .then(({ docs }) => {
        var idData = docs.map((doc) => {
          return doc.data();
        });
        return idData;
      });
  }
}
