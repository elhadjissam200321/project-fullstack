import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, of, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, Profile, AuthResponse, SignUpData, SignInData } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private isLoadingSubject = new BehaviorSubject<boolean>(true);

    public currentUser$ = this.currentUserSubject.asObservable();
    public isLoading$ = this.isLoadingSubject.asObservable();
    public isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
        map(user => !!user)
    );

    // Compat observables for legacy components
    public currentRole$ = this.currentUser$.pipe(map(user => user?.role || null));
    public currentProfile$ = this.currentUser$.pipe(
        map(user => {
            if (!user) return null;
            return {
                user_id: user.id,
                full_name: user.fullName,
                email: user.email,
                role: user.role
            } as any as Profile;
        })
    );

    constructor(private http: HttpClient) {
        this.initializeAuth();
    }

    private initializeAuth() {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('current_user');

        if (token && user) {
            try {
                this.currentUserSubject.next(JSON.parse(user));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                this.clearAuth();
            }
        }

        this.isLoadingSubject.next(false);
    }

    signUp(data: SignUpData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
            timeout(30000),
            tap(response => {
                this.handleAuthSuccess(response);
            }),
            catchError(this.handleError)
        );
    }

    signIn(data: SignInData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
            timeout(30000),
            tap(response => {
                this.handleAuthSuccess(response);
            }),
            catchError(this.handleError)
        );
    }

    signOut(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}).pipe(
            tap(() => {
                this.clearAuth();
            }),
            catchError(() => {
                // Even if API call fails, clear local auth
                this.clearAuth();
                return of(undefined);
            })
        );
    }

    getCurrentUser(): Observable<User | null> {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return of(null);
        }

        return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`).pipe(
            map(response => response.user),
            tap(user => {
                this.currentUserSubject.next(user);
                localStorage.setItem('current_user', JSON.stringify(user));
            }),
            catchError(() => {
                this.clearAuth();
                return of(null);
            })
        );
    }

    updateProfile(fullName: string): Observable<User> {
        return this.http.put<{ user: User, message: string }>(`${this.apiUrl}/auth/profile`, { fullName }).pipe(
            tap(response => {
                this.currentUserSubject.next(response.user);
                localStorage.setItem('current_user', JSON.stringify(response.user));
            }),
            map(response => response.user)
        );
    }

    getSecretQuestion(email: string): Observable<{ secretQuestion: string }> {
        return this.http.get<{ secretQuestion: string }>(`${this.apiUrl}/auth/secret-question?email=${email}`);
    }

    resetPasswordWithAnswer(data: { email: string, secretAnswer: string, newPassword: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/reset-password`, data);
    }

    // Placeholder for compilation fix
    updatePassword(password: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/profile/password`, { password });
    }

    private handleAuthSuccess(response: AuthResponse) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
    }

    private handleError = (error: any) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.name === 'TimeoutError') {
            errorMessage = 'Le serveur met trop de temps à répondre. Cela est souvent dû à un problème de DNS ou de connexion réseau. Veuillez réessayer.';
        } else if (error instanceof HttpErrorResponse) {
            errorMessage = error.error?.error || error.message;
        }

        return throwError(() => new Error(errorMessage));
    }

    private clearAuth() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
    }

    // Getter for current user value
    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    // Getter for current role
    get currentRole(): 'organisateur' | 'participant' | 'super_admin' | null {
        return this.currentUser?.role || null;
    }

    // Check if user is organisateur
    isOrganisateur(): boolean {
        return this.currentRole === 'organisateur';
    }
}
