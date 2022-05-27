import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardGuard implements CanActivate {
  constructor(
    public authService: AuthService,
    private route: Router,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    if (await this.authService.setTokens()) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: 'abc' } });
    return false;
  }
}
