import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';


import { Router, RouterModule } from '@angular/router';
import { IPaciente } from 'src/app/models/paciente';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { AuthService, Credential } from 'src/app/core/services/auth.service';

interface SignUpForm {
  nombre: FormControl<string>;
  apellido: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
  ],
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  providers: [],
})
export default class SignUpComponent {
  hide = true;
  private router = inject(Router);
  private pacienteId = '';

  get _pacienteId(): string {
    return this.pacienteId;
  }

  formBuilder = inject(FormBuilder).nonNullable;
  authService = inject(AuthService);
  pacienteService = inject(PacienteService);

  form = this.formBuilder.group<SignUpForm>({
    nombre: this.formBuilder.control(''),
    apellido: this.formBuilder.control(''),
    email: this.formBuilder.control(''),
    password: this.formBuilder.control(''),
  });

  async signUp(): Promise<void> {
    if (this.form.invalid) return;

    const credential: Credential = {
      email: this.form.value.email || '',
      password: this.form.value.password || '',
    };

    try {
      await this.authService.signUpWithEmailAndPassword(credential);

      this.router.navigateByUrl('/');
 
    } catch (error) {
      console.error(error);
    }
  }

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
}
