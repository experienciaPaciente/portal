import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { AuthService, Credential } from 'src/app/core/services/auth.service';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { RequiredComponent } from 'src/app/shared/ui/required/required.component';

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
    ButtonComponent,
    LabelComponent,
    RequiredComponent
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
    nombre: this.formBuilder.control('', Validators.required),
    apellido: this.formBuilder.control('', Validators.required),
    email: this.formBuilder.control('', Validators.email),
    password: this.formBuilder.control('', Validators.required),
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
