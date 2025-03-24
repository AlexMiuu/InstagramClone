import { Routes } from '@angular/router';
import { LoginComponent } from './authentification/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { FeedComponent } from '../frontpage/feed/feed.component';
export const routes: Routes = [

    {   
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'


    },
    {   
        path: 'login',
        component: LoginComponent

    },

    {
        path: 'feed',
        component: FeedComponent
    }
];
