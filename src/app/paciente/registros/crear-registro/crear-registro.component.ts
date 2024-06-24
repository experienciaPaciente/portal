import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { RegistrosService,  } from './../../../core/services/registros.service';
import { Paciente, Registro } from './../../../models/registro';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { Auth } from '@angular/fire/auth';

export interface RegistroForm {
  paciente: FormControl<string>;
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
  imports: [ReactiveFormsModule, RouterLink, ZXingScannerModule],
  
})

export class createRegistroComponent implements OnInit{

  ngOnInit(): void {
    
  }

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
          registro.userId = user.uid;  // Add the user's UID to the registro object
        }
        !this.registroId
          ? await this._registrosService.createRegistro(registro)
          : await this._registrosService.updateRegistro(this.registroId, registro);
        this._router.navigate(['/']);
      } catch (error) {
        // call some toast service to handle the error
    }
  }

  async setFormValues(id: string) {
    try {
      const registro = await this._registrosService.getRegistro(id);
      if (!registro) return;
      this.form.setValue({
        paciente: registro.paciente,
        descripcion: registro.descripcion,
        categoria: registro.categoria,
        validado: registro.validado,
        estado: registro.estado,
        emisor: registro.emisor,
        fecha: registro.fecha,
        hora: registro.hora,
      });
    } catch (error) {}
  }
}
