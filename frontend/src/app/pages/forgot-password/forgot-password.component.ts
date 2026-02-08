import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
    forgotPasswordForm: FormGroup;
    isLoading = false;
    isEmailSent = false;
    errorMessage: string | null = null;

    // New states for secret question flow
    step: 'email' | 'question' | 'success' = 'email';
    secretQuestion: string | null = null;
    userEmail: string | null = null;
    isPasswordReset = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            secretAnswer: [''],
            newPassword: ['', [Validators.minLength(6)]]
        });
    }

    get email() { return this.forgotPasswordForm.get('email'); }
    get secretAnswer() { return this.forgotPasswordForm.get('secretAnswer'); }
    get newPassword() { return this.forgotPasswordForm.get('newPassword'); }

    onFetchQuestion() {
        if (this.email?.invalid) {
            this.email?.markAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;
        this.userEmail = this.forgotPasswordForm.value.email;

        this.authService.getSecretQuestion(this.userEmail!).subscribe({
            next: (response) => {
                this.secretQuestion = response.secretQuestion;
                this.step = 'question';
                this.isLoading = false;
                // Add validators for next step
                this.secretAnswer?.setValidators([Validators.required]);
                this.newPassword?.setValidators([Validators.required, Validators.minLength(6)]);
                this.secretAnswer?.updateValueAndValidity();
                this.newPassword?.updateValueAndValidity();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = error.error?.error || 'Utilisateur non trouvé ou erreur serveur';
            }
        });
    }

    onResetPassword() {
        if (this.forgotPasswordForm.invalid) {
            this.forgotPasswordForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const { secretAnswer, newPassword } = this.forgotPasswordForm.value;

        this.authService.resetPasswordWithAnswer({
            email: this.userEmail!,
            secretAnswer,
            newPassword
        }).subscribe({
            next: () => {
                this.isPasswordReset = true;
                this.step = 'success';
                this.isLoading = false;
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = error.error?.error || 'La réponse est incorrecte';
            }
        });
    }
}
