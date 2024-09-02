import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { RegistrosService,  } from './../../../core/services/registros.service';
import { Registro } from './../../../models/registro';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';

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
    BadgeComponent
  ],
  
})

export class createRegistroComponent{


  ngOnInit() {
    this.onCategoryChange(); // Set initial icon and color
    this.editableTitle = this.form.controls['titulo'].value;
  }

  onTitleChange() {
    this.editableTitle = this.form.controls['titulo'].value;
  }

  onCategoryChange() {
    const categoria = this.form.controls['categoria'].value;
    if (categoria) {
      const { icon, color } = this.categoriaMap[categoria];
      this.editableIcon = icon;
      this.editableColor = color; // Assign color from the map
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
    'Consulta general': { icon: 'user-md', color: 'blue' },
    'Laboratorios': { icon: 'vial', color: 'purple' },
    'Consulta pediátrica': { icon: 'child-reaching', color: 'green' },
    'Vacunación': { icon: 'syringe', color: 'orange' },
    'Alergia e Inmunología': { icon: 'allergies', color: 'yellow' },
    'Cardiología': { icon: 'heart', color: 'red' },
  };


  // Properties for the Label component
  editableTitle: string = '';
  editableCategory: string = '';
  editableIcon: string = 'heart';
  editableColor: string = 'primary';


  categoriaOptions = Object.keys(this.categoriaMap).map((key) => ({
    value: key,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
  }));

  // Zxing  
  availableDevices: MediaDeviceInfo[] | undefined;
  currentDevice: MediaDeviceInfo | any = null;
  
  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  hasDevices: boolean | undefined;
  hasPermission: boolean | undefined;

  qrResultString: string | undefined;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  clearResult(): void {
    this.qrResultString = '';
  }
  
  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  onCamerasFound(devices: MediaDeviceInfo[] | any): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onTorchCompatible(isCompatible: boolean ): void {
    this.torchAvailable$.next(isCompatible || false);
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
