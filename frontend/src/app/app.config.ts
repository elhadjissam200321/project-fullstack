import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LucideAngularModule, LayoutDashboard, Calendar, Users, BarChart3, Settings, LogOut, Menu, X, ChevronRight, Database, Bell, Search, User, ChevronDown, Globe, CalendarCheck, TrendingUp, ArrowUpRight, ArrowDownRight, Trash2, Loader2, Clock, Plus, ArrowRight, Activity, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        Calendar,
        Users,
        BarChart3,
        Settings,
        LogOut,
        Menu,
        X,
        ChevronRight,
        Database,
        Bell,
        Search,
        User,
        ChevronDown,
        Globe,
        CalendarCheck,
        TrendingUp,
        ArrowUpRight,
        ArrowDownRight,
        Trash2,
        Loader2,
        Clock,
        Plus,
        ArrowRight,
        Activity,
        ShieldAlert,
        CheckCircle2,
        AlertTriangle
      })
    )
  ]
};


