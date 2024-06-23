import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';


import { Router, RouterModule } from '@angular/router';
import { IPaciente } from 'src/app/models/paciente';
import { PacienteService } from 'src/app/core/services/paciente.service';

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
  pacienteService = inject(PacienteService);

  form = this.formBuilder.group<SignUpForm>({
    nombre: this.formBuilder.control(''),
    apellido: this.formBuilder.control(''),
    email: this.formBuilder.control(''),
    password: this.formBuilder.control(''),
  });


  async signUp() {
    if (this.form.invalid) return;

    try {
      const paciente = this.form.value as IPaciente;
      !this.pacienteId
        ? await this.pacienteService.createPaciente(paciente)
        : await this.pacienteService.updatePaciente(this.pacienteId, paciente);
      this.router.navigate(['/']);
    } catch (error) {
      // call some toast service to handle the error
      console.log('Not able to create user!')
    }
  }

  get isEmailValid(): string | boolean {
    const control = this.form.get('email');
    
    // Agregar lógica para checkeo de credenciales

    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid email';
    }

    return false;
  }
}
