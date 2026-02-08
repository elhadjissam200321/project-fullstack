import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppRole } from '../../models/models';

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
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;
    errorMessage: string | null = null;

    // Standard security questions
    securityQuestions = [
        'Quel est le nom de votre premier animal de compagnie ?',
        'Quelle est votre ville de naissance ?',
        'Quel était le nom de votre première école ?',
        'Quel est le nom de jeune fille de votre mère ?',
        'Quelle est votre couleur préférée ?'
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            role: ['participant', [Validators.required]],
            secretQuestion: [this.securityQuestions[0], [Validators.required]],
            secretAnswer: ['', [Validators.required, Validators.minLength(2)]],
            school: ['', [Validators.maxLength(200)]],
            fatherName: ['', [Validators.maxLength(100)]],
            motherName: ['', [Validators.maxLength(100)]],
            phone: ['', [Validators.maxLength(20)]]
        }, { validators: passwordMatchValidator });
    }

    get fullName() { return this.registerForm.get('fullName'); }
    get email() { return this.registerForm.get('email'); }
    get password() { return this.registerForm.get('password'); }
    get confirmPassword() { return this.registerForm.get('confirmPassword'); }
    get role() { return this.registerForm.get('role'); }
    get school() { return this.registerForm.get('school'); }
    get fatherName() { return this.registerForm.get('fatherName'); }
    get motherName() { return this.registerForm.get('motherName'); }
    get phone() { return this.registerForm.get('phone'); }

    get selectedRole(): AppRole {
        return this.registerForm.get('role')?.value as AppRole;
    }

    setRole(role: AppRole) {
        this.registerForm.patchValue({ role });
    }

    onSubmit() {
        if (this.registerForm.invalid) {
            Object.keys(this.registerForm.controls).forEach(key => {
                this.registerForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.isLoading = true;
        this.errorMessage = null;

        const formValue = this.registerForm.value;

        this.authService.signUp({
            email: formValue.email,
            password: formValue.password,
            fullName: formValue.fullName,
            role: formValue.role as AppRole,
            secretQuestion: formValue.secretQuestion,
            secretAnswer: formValue.secretAnswer,
            school: formValue.school || undefined,
            fatherName: formValue.fatherName || undefined,
            motherName: formValue.motherName || undefined,
            phone: formValue.phone || undefined
        }).subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }
}
