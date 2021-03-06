import { CoursePageGuardGuard } from './shared/guards/course-page-guard.guard';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { HomeComponent } from './view/home/home.component';
import { CoursePageComponent } from './view/course-page/course-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './view/page-not-found/page-not-found.component';
import { RegistrationComponent } from './view/registration/registration.component';
import { HomeGuardGuard } from './shared/guards/home-guard.guard';
import { AuthGuardGuard } from './shared/guards/auth-guard.guard';
import { AddCourseFormComponent } from './view/add-course-form/add-course-form.component';
import { LectureVidPageComponent } from './view/lecture-vid-page/lecture-vid-page.component';
import { FileFormComponent } from './file-form/file-form.component';
import { ProfileComponent } from './view/profile/profile.component';

//array of objects where each object specifies a mapping of a url to a component
//const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const routes: Routes = [
  {path: '', redirectTo:'/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent, canActivate: [HomeGuardGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardGuard]},
  {path: 'registration', component: RegistrationComponent, canActivate: [HomeGuardGuard]},
  {path: 'course-page', component: CoursePageComponent, canActivate: [CoursePageGuardGuard, AuthGuardGuard]},
  {path: 'lecture', component: LectureVidPageComponent, canActivate: [AuthGuardGuard]},
  {path: 'add-course', component: AddCourseFormComponent, canActivate: [AuthGuardGuard]},
  {path: 'test-upload', component: FileFormComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuardGuard]},
  //error unspecified path (** matches your url)

  {path: '**', component: PageNotFoundComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

 }