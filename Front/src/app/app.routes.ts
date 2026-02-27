import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [

    {
        path: '',
        loadComponent: () => import('./pages/auth/auth').then(m => m.Auth)
    },
    {
        path: 'home',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'contracts',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/contracts/contracts').then(m => m.Contracts)
    },
    {
        path: 'contracts/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/contract/contract').then(m => m.Contract)
    },
    {
        path: 'properties',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/properties/properties').then(m => m.Properties)
    },
    {
        path: 'properties/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/property/property').then(m => m.Property)
    },
    {
        path: 'tenants',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/tenants/tenants').then(m => m.Tenants)
    },
    {
        path: 'tenants/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/tenant/tenant').then(m => m.Tenant)
    },
    {
        path: 'payments',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/payments/payments').then(m => m.Payments)
    },
    {
        path: 'statistics',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/statistics/statistics').then(m => m.Statistics)
    },
    {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
    },
    {
        path: 'admin',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/admin/admin').then(m => m.Admin)
    },
    {
        path: '**',
        redirectTo: ''
    }

];
