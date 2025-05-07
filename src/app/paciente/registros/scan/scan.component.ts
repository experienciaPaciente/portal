import { Component, HostListener, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import {
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { CardComponent } from 'src/app/shared/ui/card/card.component';
import { QrService } from 'src/app/core/services/qr.service';
import { Registro } from './../../../models/registro';

export interface RegistroForm {
  paciente: FormControl<string>;
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  categoria: FormControl<string>;
  estado: FormControl<string>;
  validado: FormControl<boolean | null>;
  lugar: FormControl<string>;
  validador: FormControl<string>;
  fecha: FormControl<Date>;
  hora: FormControl<string>;
  adjuntos: FormControl<Array<string>>;
}


@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ZXingScannerModule,
    LabelComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent
  ],
})

export class ScanComponent {
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
  qrResultString!: string;
  noPermissions = false;
  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;  
  isMobile!: boolean;
  qrRegistro: boolean = true;
  registro?: Registro;

  constructor(
    private router: Router,
    private QrService: QrService
  ) {}

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile(event.target.innerWidth);
  }
  
  ngOnInit() {
    this.checkCameraPermissions();
  }

  checkCameraPermissions() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        this.noPermissions = false;
      })
      .catch(() => {
        this.noPermissions = true;
      });
  }

  onCodeResult(resultString: string): void {
    this.qrResultString = resultString;
    this.QrService.setQRData(this.qrResultString);

    // Parsear los datos del QR
    const parsedData = this.parseQRData(this.qrResultString);

    // Autocompletar los campos del formulario
    setTimeout(() => {
      this.populateFormFromQR(parsedData);
    }, 100);

    // setTimeout()
    this.router.navigate(['/registrar']);
  }

 private parseQRData(qrString: string): Partial<Registro> {
    console.log('Raw QR String:', qrString); // Verifica el texto completo del QR
    const lines = qrString.split('\n');
    const data: Partial<Registro> = {};

    // Iterar por cada línea y extraer "Campo: Valor"
    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(': ');
      const value = valueParts.join(': ').trim();
      console.log('Key:', key, 'Value:', value); // Verifica clave y valor

      // Mapear los valores del string al formato de Registro
      switch (key.toLowerCase()) {
        case 'título':
          data.titulo = value;
          break;
        case 'descripción':
          data.descripcion = value;
          break;
        case 'fecha':
          data.fecha = new Date(value);
          break;
        case 'hora':
          data.hora = value;
          break;
        case 'categoria':
          data.categoria = value;
          break;
        case 'validado':
          data.validado = value.toLowerCase() === 'true';
          break;
        case 'estado':
          data.estado = value;
          break;
        case 'emisor':
          data.validador = value;
          break;
        case 'adjuntos':
          data.adjuntos = value.split(',').map((url) => url.trim());
          break;
      }
    });

    return data;
  }
  private _formBuilder = inject(FormBuilder).nonNullable;

  form = this._formBuilder.group<RegistroForm>({
    paciente: this._formBuilder.control(''),
    titulo: this._formBuilder.control('', Validators.required),
    descripcion: this._formBuilder.control('', Validators.required),
    categoria: this._formBuilder.control('', Validators.required),
    estado: this._formBuilder.control(''),
    validado: this._formBuilder.control(null),
    lugar: this._formBuilder.control('', Validators.required),
    validador: this._formBuilder.control(''),
    fecha: this._formBuilder.control<Date>(new Date, Validators.required),
    hora: this._formBuilder.control('', Validators.required),
    adjuntos: this._formBuilder.control<string[]>([]),
  });

  private populateFormFromQR(data: Partial<Registro>): void {
    if (!data) return;
    try {
      // Usar patchValue para solo rellenar los campos existentes
      this.form.patchValue({
        paciente: data.paciente,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha: data.fecha,
        hora: data.hora,
        categoria: data.categoria,
        validado: data.validado,
        estado: data.estado,
        validador: data.validador,
        adjuntos: data.adjuntos || []
      });
    }  
      catch (error) {
        console.error('Error during patchValue:', error);
      }  
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

  checkIfMobile(width: number): void {
    this.isMobile = width < 768;
    // this.updateViewState(this.router.url);
  }

  cancel() {
    this.qrRegistro = !this.qrRegistro;
  }
}
