import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './pages/public-layout.component';
import { DashboardLayoutComponent } from './pages/dashboard/dashboard-layout.component';
import { SuperAdminDashboardComponent } from './pages/super-admin/super-admin-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageEventsComponent } from './pages/manage-events/manage-events.component';
import { ManageParticipantsComponent } from './pages/manage-participants/manage-participants.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    // Public routes in PublicLayout
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent },
            { path: 'events/:id', component: EventDetailsComponent },
            {
                path: 'profile',
                component: ProfileComponent,
                canActivate: [authGuard]
            },
        ]
    },

    // Protected dashboard routes in DashboardLayout
    {
        path: 'dashboard',
        component: DashboardLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { requiredRole: 'organisateur' },
        children: [
            { path: '', redirectTo: 'statistics', pathMatch: 'full' },
            { path: 'events', component: ManageEventsComponent },
            { path: 'events/:id', component: ManageEventsComponent }, // To match React optional param
            { path: 'participants', component: ManageParticipantsComponent },
            { path: 'participants', component: ManageParticipantsComponent },
            { path: 'statistics', component: StatisticsComponent },
            {
                path: 'admin',
                component: SuperAdminDashboardComponent,
                data: { requiredRole: 'super_admin' } // Child guard check? No, parent runs first.
            },
        ]
    },

    // 404 Not Found
    {
        path: 'not-found',
        component: NotFoundComponent
    },

    // Wildcard route for 404
    {
        path: '**',
        redirectTo: 'not-found'
    }
];
