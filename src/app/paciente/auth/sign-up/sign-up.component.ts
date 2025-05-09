import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  dni: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  grupoSanguineo: FormControl<string>;
  alergia: FormControl<string>;
  otraAlergia: FormControl<string>;
}

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    LabelComponent,
    RequiredComponent,
    CardComponent,
    CommonModule
  ],
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  providers: [],
})
export default class SignUpComponent {
  hide = true;
  isMobile = false;
  direction = 'column';
  hasChange = false;
  otraAlergia = false;
  moreInfo = true;
  editableType: string = '';
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
  errorMessage?: string;


  form = this.formBuilder.group<SignUpForm>({
    nombre: this.formBuilder.control(''),
    apellido: this.formBuilder.control(''),
    dni: this.formBuilder.control(''),
    email: this.formBuilder.control('', {validators: [Validators.email, Validators.required]}),
    password: this.formBuilder.control('', Validators.required),
    grupoSanguineo: this.formBuilder.control(''),
    alergia: this.formBuilder.control(''),
    otraAlergia: this.formBuilder.control(''),
    confirmPassword: this.formBuilder.control('', {
     validators: [Validators.required,
      this.passwordFormatValidator()]
    }),
  });

  ngOnInit(): void {
    this.checkIfMobile(window.innerWidth);
  }

  checkIfMobile(width: number): void {
    this.isMobile = width < 768;
    this.moreInfo = this.isMobile;
  }

  passwordFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /\d/.test(control.value);
      const uppercase = /[A-Z]/.test(control.value);
      const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);
      const length = control.value?.length >= 8;

      return valid && uppercase && symbol && length ? null : { invalidPasswordFormat: true };
    };
  }

  documentValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toString() || '';
      const valid = /^\d{1,8}$/.test(value);
      return valid ? null : { invalidDocumentoFormat: true };
    };
  }

  private traducirErrorFirebase(error: any): string {
    const code = error.code || error.message;
  
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está en uso.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      case 'auth/missing-password':
        return 'Debe ingresar una contraseña.';
      case 'auth/network-request-failed':
        return 'Error de red. Verifique su conexión.';
      default:
        return 'Ha ocurrido un error. Intente nuevamente.';
    }
  }

  async signUp(): Promise<void> {
    if (this.form.invalid || this.passwordsDoNotMatch) {
      this.showErrorMsg = true;
      return;
    }
    
    const credential: Credential = {
      name: this.form.value.nombre || '',
      lastName: this.form.value.apellido || '',
      dni: this.form.value.dni || '',
      email: this.form.value.email || '',
      password: this.form.value.password || '',
      grupoSanguineo: this.form.value.grupoSanguineo || '',
      alergia: this.form.value.alergia || '',
      otraAlergia: this.form.value.otraAlergia || '',
    };
    
    try {
      await this.authService.signUpWithEmailAndPassword(credential);
      this.showConfirmMsg = true;
  
      setTimeout(() => {
        this.router.navigateByUrl('/ingresar');
      }, 1500);
      
    } catch (error: any) {
      this.showErrorMsg = true;
      this.errorMessage = this.traducirErrorFirebase(error);
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


  onGruposChange() {
    const grupo = this.form.controls['grupoSanguineo'].value;
    this.hasChange = true;
    this.editableType = grupo;
  }

  onAlergiasChange(): void {
    const selected = this.form.get('alergia')?.value;
    this.otraAlergia = selected === 'Otra';
  
    if (!this.otraAlergia) {
      this.form.get('otraAlergia')?.reset();
    }
  }

  grupos: string[] = [
    'A+',
    'A−',
    'B+',
    'B−',
    'AB+',
    'AB−',
    'O+',
    'O−'
  ];

  alergias: string[] = [
    'Ácaros del polvo',
    'Pólenes',
    'Hongos ambientales',
    'Pelo de gato',
    'Pelo de perro',
    'Picaduras de insectos',
    'Lácteos',
    'Maní',
    'Frutos secos',
    'Soja',
    'Trigo (gluten)',
    'Pescado',
    'Mariscos',
    'Huevos',
    'Penicilina',
    'Aspirina',
    'Antiinflamatorios',
    'Latex',
    'Níquel',
    'Otra'
  ];
}
