import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { AppRole } from '../models/models';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRole = route.data['requiredRole'] as AppRole;

    return authService.currentUser$.pipe(
        take(1),
        map(user => {
            // Super Admin can access everything
            if (user?.role === 'super_admin' || user?.role === requiredRole) {
                return true;
            } else {
                // Redirect to home if role doesn't match
                router.navigate(['/']);
                return false;
            }
        })
    );
};
