import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: '',
        loadComponent: () => import('./pages/auth/auth').then(m => m.Auth)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'properties',
        loadComponent: () => import('./pages/properties/properties').then(m => m.Properties)
    },
    {
        path: 'tenants',
        loadComponent: () => import('./pages/tenants/tenants').then(m => m.Tenants)
    },
    {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payments').then(m => m.Payments)
    },
    {
        path: 'statistics',
        loadComponent: () => import('./pages/statistics/statistics').then(m => m.Statistics)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
    },
    {
        path: '**',
        redirectTo: ''
    }

];
