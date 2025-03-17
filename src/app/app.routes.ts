import { Routes } from '@angular/router';
import { LoginComponent } from './authentification/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
export const routes: Routes = [

    {   
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'


    },
    {   
        path: 'login',
        component: LoginComponent

    }
];
