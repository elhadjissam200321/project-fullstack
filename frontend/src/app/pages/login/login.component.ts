import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;
    returnUrl: string = '/';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit() {
        // Get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            Object.keys(this.loginForm.controls).forEach(key => {
                this.loginForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const { email, password } = this.loginForm.value;

        this.authService.signIn({ email, password }).subscribe({
            next: () => {
                this.router.navigate([this.returnUrl]);
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.message === 'Invalid login credentials'
                    ? 'Email ou mot de passe incorrect'
                    : error.message || 'Une erreur est survenue lors de la connexion';
            },
            complete: () => {
                // This might not fire if navigation happens in next, but safe to keep
                this.isLoading = false;
            }
        });
    }
}
