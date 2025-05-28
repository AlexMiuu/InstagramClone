import { Routes } from '@angular/router';
import { LoginComponent } from './authentification/login/login.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { FeedComponent } from '../frontpage/feed/feed.component';
import { RegisterComponent } from './authentification/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { environment } from "../environments/environment";
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
    },

    {
        path: 'register',
        component: RegisterComponent
    },

    {
        path: "profile",
        component: ProfileComponent
      },
      {
        path: "admin",
        component: AdminComponent
      },
      // Only add test-runner in development
      ...(environment.production
        ? []
        : [
            {
              path: "test-runner",
              loadChildren: () =>
                import("./test-runner/test-runner.module").then((m) => m.TestRunnerModule),
            },
          ]),
];
