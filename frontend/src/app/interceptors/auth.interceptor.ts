import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP Interceptor to add JWT token to all requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    // Clone request and add Authorization header if token exists
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};
