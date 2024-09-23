import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
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
import { CardComponent } from 'src/app/shared/ui/card/card.component';

interface SignUpForm {
  nombre: FormControl<string>;
  apellido: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    ButtonComponent,
    LabelComponent,
    RequiredComponent,
    CardComponent
  ],
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  providers: [],
})
export default class SignUpComponent {
  hide = true;
  showConfirmMsg = false;
  showErrorMsg = false;
  confirmPassword = '';
  passHasChange = false;
  passwordHelpText = `
  Por favor, asegúrate de que tu contraseña cumpla con los siguientes requisitos:
  Longitud Mínima: La contraseña debe tener al menos 8 caracteres.
  Incluye un Número: Debe contener al menos un número (0-9).
  Mayúsculas: Debe incluir al menos una letra mayúscula (A-Z).
  Símbolos Especiales: Debe tener al menos un símbolo especial, como: ! @ # $ % ^ & * ( ) , . ? " : { } | < >.
`;

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
    confirmPassword: this.formBuilder.control('', {
     validators: [Validators.required,
      this.passwordFormatValidator()]
    }),
  });

  // Custom Validator for password format (must contain at least one number)
  passwordFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /\d/.test(control.value);
      const uppercase = /[A-Z]/.test(control.value);
      const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
      const length = control.value?.length >= 8;
      // const combined = /\d/.test(control.value) && /[A-Z]/.test(control.value) && control.value?.length >= 8;

      return valid && uppercase && symbol && length ? null : { invalidPasswordFormat: true };
    };
  }

  async signUp(): Promise<void> {
    if (this.form.invalid) {
      this.showErrorMsg = true;
      return;
    };
    
    const credential: Credential = {
      email: this.form.value.email || '',
      password: this.form.value.password || '',
    };
    
    try {
      await this.authService.signUpWithEmailAndPassword(credential);
      this.showConfirmMsg = true;
      setTimeout(() => {
          this.router.navigateByUrl('/ingresar'); 
        }, 2000
      )
    } catch (error) {
      console.error(error);
    }
  }
  get isEmailValid(): string | boolean {
    const control = this.form.get('email');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'Este campo es requerido'
        : 'Ingrese un mail válido';
    }
    return false;
  }

  get passwordsDoNotMatch(): boolean {
    return this.form.controls['password'].value !== this.form.controls['confirmPassword'].value;
  }

}
