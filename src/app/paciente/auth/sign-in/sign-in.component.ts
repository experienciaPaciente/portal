import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Credential } from '../../../core/services/auth.service';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { RequiredComponent } from 'src/app/shared/ui/required/required.component';

interface LogInForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    LabelComponent,
    ButtonComponent,
    RequiredComponent
  ],
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
})
export default class LogInComponent {
  hide = true;

  formBuilder = inject(FormBuilder);

  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup<LogInForm> = this.formBuilder.group({
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  get isEmailValid(): string | boolean {
    const control = this.form.get('email');

    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid email';
    }

    return false;
  }

  async logIn(): Promise<void> {
    if (this.form.invalid) return;

    const credential: Credential = {
      email: this.form.value.email || '',
      password: this.form.value.password || '',
    };

    try {
      await this.authService.logInWithEmailAndPassword(credential);

      this.router.navigateByUrl('/');

    } catch (error) {
      console.error(error);
    }
  }

  openSnackBar() {
    return alert('Succesfully Log in 😀')
  }
}
