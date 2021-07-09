import { Component } from '@angular/core';
import { faLastfmSquare } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'cradle';
  hasLoggedIn = false;

  login() {
    this.hasLoggedIn = true;
  }
}
