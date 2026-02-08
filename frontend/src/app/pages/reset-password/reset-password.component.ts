import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
        return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
    resetPasswordForm: FormGroup;
    isLoading = false;
    isSuccess = false;
    errorMessage: string | null = null;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.resetPasswordForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: passwordMatchValidator });
    }

    get password() {
        return this.resetPasswordForm.get('password');
    }

    get confirmPassword() {
        return this.resetPasswordForm.get('confirmPassword');
    }

    onSubmit() {
        if (this.resetPasswordForm.invalid) {
            Object.keys(this.resetPasswordForm.controls).forEach(key => {
                this.resetPasswordForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const { password } = this.resetPasswordForm.value;

        this.authService.updatePassword(password).subscribe({
            next: () => {
                this.isSuccess = true;
                this.isLoading = false;
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = error.message || 'Une erreur est survenue';
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }
}
