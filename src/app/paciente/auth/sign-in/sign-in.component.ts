import { Component, inject, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Credential } from '../../../core/services/auth.service';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { RequiredComponent } from 'src/app/shared/ui/required/required.component';
import { CardComponent } from 'src/app/shared/ui/card/card.component';

interface LogInForm {
  nombre: FormControl<string | null>;
  apellido: FormControl<string | null>;
  email: FormControl<string>;
  password: FormControl<string>;
  grupoSanguineo: FormControl<string>;
  alergia: FormControl<string>;
  otraAlergia: FormControl<string>;
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    LabelComponent,
    ButtonComponent,
    RequiredComponent,
    CardComponent,
    CommonModule
  ],
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
})
export default class LogInComponent {
  hide = true;
  successMessage = '';
  errorMessage = '';
  isMobile = false;

  formBuilder = inject(FormBuilder);

  private authService = inject(AuthService);
  private router = inject(Router);

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.checkIfMobile(window.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768; 
  }

  form: FormGroup<LogInForm> = this.formBuilder.group({
    nombre: this.formBuilder.control(''),
    apellido: this.formBuilder.control(''),
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    grupoSanguineo: this.formBuilder.control('', { nonNullable: true }),
    alergia: this.formBuilder.control('',{ nonNullable: true }),
    otraAlergia: this.formBuilder.control('',{ nonNullable: true }),
  });

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

  async logIn(): Promise<void> {
    if (this.form.invalid) return;

    const credential: Credential = {
      name: this.form.value.email || '',
      lastName: this.form.value.email || '',
      email: this.form.value.email || '',
      password: this.form.value.password || '',
      grupoSanguineo: this.form.value.grupoSanguineo || '',
      alergia: this.form.value.alergia || '',
      otraAlergia: this.form.value.otraAlergia || '',
    };

    try {
      await this.authService.logInWithEmailAndPassword(credential);
      this.successMessage = 'Usuario autenticado, redirigiendo...';
      this.errorMessage = '';
      this.router.navigateByUrl('/');
    } catch (error) {
      this.successMessage = '';
      this.errorMessage = 'Las credenciales ingresadas no son correctas';    }
  }

  openSnackBar() {
    return alert('Succesfully Log in')
  }
}
