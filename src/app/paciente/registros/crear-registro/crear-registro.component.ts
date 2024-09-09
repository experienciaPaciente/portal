import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { RegistrosService,  } from './../../../core/services/registros.service';
import { Registro } from './../../../models/registro';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { QrService } from 'src/app/core/services/qr.service';
import { Subscription } from 'rxjs';
import { SwitcherComponent } from 'src/app/shared/ui/switcher/switcher.component';

export interface RegistroForm {
  paciente: FormControl<string>;
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  categoria: FormControl<string>;
  validado: FormControl<boolean>;
  estado: FormControl<string>;
  emisor: FormControl<string>;
  fecha: FormControl<Date>;
  hora: FormControl<string>;
}

@Component({
  selector: 'app-crear-registro',
  styleUrl: './crear-registro.component.scss',
  templateUrl: './crear-registro.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ZXingScannerModule,
    LabelComponent,
    BadgeComponent,
    ButtonComponent,
    LabelComponent,
    SwitcherComponent
  ],
})

export class createRegistroComponent implements OnInit{

  qrResultString: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private QrService: QrService
  ) {}

  ngOnInit() {
    this.onCategoryChange();
    this.editableTitle = this.form.controls['titulo'].value;

    this.subscription = this.QrService.qrData$.subscribe((data) => {
        this.qrResultString = data;
        this.setPacienteValue(data ?? '');
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onTitleChange() {
    this.editableTitle = this.form.controls['titulo'].value;
  }

  onCategoryChange() {
    const categoria = this.form.controls['categoria'].value;
    if (categoria) {
      const { icon, color } = this.categoriaMap[categoria];
      this.editableIcon = icon;
      this.editableColor = color;
      this.editableCategory = categoria;
    }
  }

  // considerar utilizar un enum o crear una colección para especialidades
  categorias: string[] = [
    'Consulta general',
    'Laboratorios',
    'Consulta pediátrica',
    'Vacunación',
    'Alergia e Inmunología',
    'Cardiología'
  ];

  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Consulta general': { icon: 'user', color: 'blue' },
    'Laboratorios': { icon: 'vial', color: 'purple' },
    'Consulta pediátrica': { icon: 'child', color: 'green' },
    'Vacunación': { icon: 'syringe', color: 'orange' },
    'Alergia e Inmunología': { icon: 'allergies', color: 'yellow' },
    'Cardiología': { icon: 'heart', color: 'red' },
  };

  // Properties for the Label component
  editableTitle: string = '';
  editableCategory: string = '';
  editableIcon: string = 'heart';
  editableColor: string = '';

  categoriaOptions = Object.keys(this.categoriaMap).map((key) => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
  }));

  clearResult(): void {
    this.qrResultString = '';
  }

  private _formBuilder = inject(FormBuilder).nonNullable;
  private _router = inject(Router);
  private _registrosService = inject(RegistrosService);
  private _registroId = '';
  private auth: Auth = inject(Auth);


  get registroId(): string {
    return this._registroId;
  }

  @Input() set registroId(value: string) {
    this._registroId = value;
    this.setFormValues(this._registroId);
  }

  form = this._formBuilder.group<RegistroForm>({
    paciente: this._formBuilder.control(''),
    titulo: this._formBuilder.control(''),
    descripcion: this._formBuilder.control(''),
    categoria: this._formBuilder.control(''),
    validado: this._formBuilder.control(false),
    estado: this._formBuilder.control(''),
    emisor: this._formBuilder.control(''),
    fecha: this._formBuilder.control<Date>(new Date),
    hora: this._formBuilder.control('')
  });

  getPacienteControl() {
    return this.form.get('paciente');
  }

  // Method to read the value of the 'paciente' control
  getPacienteValue(): string | undefined {
    return this.getPacienteControl()?.value;
  }

  // Method to update the value of the 'paciente' control
  setPacienteValue(newValue: string): void {
    this.getPacienteControl()?.setValue(newValue);
  }
  
  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    this.setPacienteValue(resultString);
  }
  
  async createRegistro() {
    const user = await this.auth.currentUser;

      if (this.form.invalid) return;

      try {
        const registro = this.form.value as Registro;
        if (user) {
          registro.userId = user.uid;
        }
        !this.registroId
          ? await this._registrosService.createRegistro(registro)
          : await this._registrosService.updateRegistro(this.registroId, registro);
        this._router.navigate(['/']);
      } catch (error) {
    }
  }

  async setFormValues(id: string) {
    try {
      const registro = await this._registrosService.getRegistro(id);
      if (!registro) return;
      this.form.setValue({
        paciente: registro.paciente || '',
        titulo: registro.titulo || '',
        descripcion: registro.descripcion || '',
        categoria: registro.categoria || '',
        validado: registro.validado ?? false,
        estado: registro.estado || '',
        emisor: registro.emisor || '',
        fecha: registro.fecha || new Date(),
        hora: registro.hora || '',
      });
    } catch (error) {}
  }
}
