import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { RegistrosService,  } from './../../../core/services/registros.service';
import { Registro } from './../../../models/registro';
import { Auth } from '@angular/fire/auth';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';
import { QrService } from 'src/app/core/services/qr.service';
import { Subscription } from 'rxjs';
import { SwitcherComponent } from 'src/app/shared/ui/switcher/switcher.component';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { ScanComponent } from '../scan/scan.component';
import { Location } from '@angular/common';
import { RequiredComponent } from 'src/app/shared/ui/required/required.component';
import { CommonModule } from '@angular/common';
import { CardComponent } from 'src/app/shared/ui/card/card.component';
import { NotificationService } from './../../../core/services/mensajes.service';

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
  selector: 'app-crear-registro',
  styleUrl: './crear-registro.component.scss',
  templateUrl: './crear-registro.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LabelComponent,
    BadgeComponent,
    ButtonComponent,
    LabelComponent,
    SwitcherComponent,
    ScanComponent,
    RequiredComponent,
    CommonModule,
    CardComponent
  ],
})

export class createRegistroComponent implements OnInit{

  isMobile = false;
  qrResultString: string | null = null;
  qrRegister!: boolean;
  private subscription: Subscription = new Subscription();
  validado = true;
  registroId: string | null = null;
  registro?: Registro;
  hasChange: boolean = false;
  uploadedImages: string[] = [];
  uploadedFileNames: string[] = [];

  showConfirmMsg = false;
  showErrorMsg = false;
  hide = true;

  checkIfMobile(width: number): void {
    this.isMobile = width < 768; 
  }

  constructor(
    private QrService: QrService,
    private storage: Storage, 
    private firestore: Firestore,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService
  ) {}

// Notificaciones
  triggerSuccess() {
    this.notificationService.addNotification('Registro creado con éxito!', 'success');
  }

  triggerError() {
    this.notificationService.addNotification('Error al generar el registro', 'error');
  }

  ngOnInit() {
    this.checkIfMobile(window.innerWidth);
    this.registroId = this._activatedRoute.snapshot.paramMap.get('id');
    
    if (this.registroId) {
      this.loadRegistroData(this.registroId);
    }

    this.setTitle();
    this.onCategoryChange();

    this.subscription = this.QrService.qrData$.subscribe((data) => {
        this.qrResultString = data;
        this.setPacienteValue(data ?? '');
      });

    // Date
    const today = new Date();

    const formattedDate: any = today.toISOString().split('T')[0];
    this.form.controls['fecha'].setValue(formattedDate);  
    
    const hours = today.getHours().toString().padStart(2, '0');  
    const minutes = today.getMinutes().toString().padStart(2, '0');  
    const formattedTime = `${hours}:${minutes}`;  
    this.form.controls['hora'].setValue(formattedTime);  

    const dateTime: any = `Registro del ${formattedDate} - ${formattedTime}`;
    this.form.controls['titulo'].setValue(dateTime);  
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.form.get('adjuntos')?.value.forEach(url => URL.revokeObjectURL(url));
  }

  onTitleChange() {
    return this.hasChange = true;
  }

  setTitle() {
    return this.form.controls['titulo'].value;
  }

  validateRecord() {
    this.validado = !this.validado;
    this.form.controls['validado'].setValue(this.validado);
  }

  onCategoryChange() {
    const categoria = this.form.controls['categoria'].value;
    if (categoria) {
      const { icon, color } = this.categoriaMap[categoria];
      this.editableIcon = icon;
      this.editableColor = color;
      this.editableCategory = categoria;
    }
    this.hasChange = true;
  }

  categorias: string[] = [  
    'Acción médica',
    'Alteración de la salud',
    'Atención virtual',
    'Consulta de salud',
    'Consulta ginecológica',
    'Consulta odontológica',
    'Consulta pediátrica',
    'Control de salud',
    'Dispositivo',
    'Emergencia médica',
    'Estudios por imagen',
    'Internación',
    'Laboratorio',
    'Medicamento',
    'Prescripción',
    'Salud mental',
    'Sesión kinesiológica',
    'Tratamiento',
    'Turno',
    'Vacuna',
    'Cardiología',
    'Dermatología'
  ];  
  
  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Acción médica': { icon: 'user-nurse', color: '#00bcd4' },             
    'Alteración de la salud': { icon: 'person-dots-from-line', color: '#ff5722' }, 
    'Atención virtual': { icon: 'laptop-medical', color: '#00bcd4' },
    'Consulta de salud': { icon: 'hand-holding-medical', color: '#17a2b8' },               
    'Consulta ginecológica': { icon: 'venus', color: '#e83e8c' },              
    'Consulta odontológica': { icon: 'tooth', color: '#d3d3d3' },              
    'Consulta pediátrica': { icon: 'child', color: '#F5C451' },               
    'Control de salud': { icon: 'notes-medical', color: '#17a2b8' },               
    'Dispositivo': { icon: 'crutch', color: '#6c757d' },                     
    'Emergencia médica': { icon: 'square-h', color: '#f44336' },
    'Estudios por imagen': { icon: 'x-ray', color: '#00bcd4' },
    'Internación': { icon: 'bed-pulse', color: '#212529' },
    'Laboratorio': { icon: 'flask', color: '#8e44ad' },
    'Medicamento': { icon: 'pills', color: '#6f42c1' },         
    'Prescripción': { icon: 'file-medical', color: '#007bff' },
    'Salud mental': { icon: 'comments', color: '#20c997' },
    'Sesión kinesiológica': { icon: 'dumbbell', color: '#20c997' },
    'Tratamiento': { icon: 'hand-holding-heart', color: '#20c997' },                 
    'Turno': { icon: 'calendar-day', color: '#28a745' },                     
    'Vacuna': { icon: 'syringe', color: '#00bcd4' },
    'Cardiología': { icon: 'heart', color: '#dc3545' },
    'Dermatología': { icon: 'hand-dots', color: '#fd7e14' }
  };  
  
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
  private auth: Auth = inject(Auth);

  form = this._formBuilder.group<RegistroForm>({
    paciente: this._formBuilder.control(''),
    titulo: this._formBuilder.control('', Validators.required),
    descripcion: this._formBuilder.control(''),
    categoria: this._formBuilder.control('', Validators.required),
    estado: this._formBuilder.control(''),
    validado: this._formBuilder.control(null),
    lugar: this._formBuilder.control(''),
    validador: this._formBuilder.control(''),
    fecha: this._formBuilder.control<Date>(new Date, Validators.required),
    hora: this._formBuilder.control('', Validators.required),
    adjuntos: this._formBuilder.control<string[]>([]),
  });

  getPacienteControl() {
    return this.form.get('paciente');
  }

  getPacienteValue(): string | undefined {
    return this.getPacienteControl()?.value;
  }

  setPacienteValue(newValue: string): void {
    this.getPacienteControl()?.setValue(newValue);
  }
  
  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    this.setPacienteValue(resultString);
  }

  async loadRegistroData(id: string) {
    try {
      const registro = await this._registrosService.getRegistro(id);
      if (registro) {
        this.form.patchValue({
          paciente: registro.paciente,
          titulo: registro.titulo,
          descripcion: registro.descripcion,
          categoria: registro.categoria,
          estado: registro.estado,
          validado: registro.validado,
          lugar: registro.lugar,
          validador: registro.validador,
          fecha: registro.fecha,
          hora: registro.hora,
          adjuntos: registro.adjuntos || []
        });
        
        this.uploadedImages = registro.adjuntos || [];
        this.uploadedFileNames = registro.adjuntos?.map(url => {
          try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/');
            const filename = pathSegments[pathSegments.length - 1];
            return filename.includes('_') ? filename.split('_').slice(1).join('_') : filename;
          } catch {
            return 'Archivo adjunto';
          }
        }) || [];
      }
    } catch (error) {
      console.error('Error descargando registro:', error);
    }
  }
  
  async createRegistro() {
    const user = await this.auth.currentUser;
  
    if (this.form.invalid) return;
  
    try {
      const registro = this.form.value as Registro;
  
      registro.adjuntos = registro.adjuntos.filter((url) => this.isValidUrl(url));
  
      if (user) {
        registro.userId = user.uid;
      }
  
      if (!this.registroId) {
        await this._registrosService.createRegistro(registro);
      } else {
        await this._registrosService.updateRegistro(this.registroId, registro);
      }
      this._router.navigate(['/']);
      this.triggerSuccess();
    } catch (error) {
      this.triggerError();
    }
  }
  
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
        estado: registro.estado || '',
        validado: registro.validado ?? false,
        lugar: registro.lugar || '',
        validador: registro.validador || '',
        fecha: registro.fecha || new Date(),
        hora: registro.hora || '',
        adjuntos: registro.adjuntos || []
      });
    } catch (error) {}
  }

  showQrRegister() {
    this.qrRegister = !this.qrRegister;
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    } 
  }

  cancel() {
    if (this.form) {
      this.form.reset();
    }
    this.router.navigate(['/']);
  }

  // Uploads
  uploadFiles(event: any) {
    const files: FileList = event.target.files;
    if (!files.length) return;
  
    const maxSizeMB = 1;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
    Array.from(files).forEach((file: File) => {
      if (file.size > maxSizeBytes) {
        alert(`El archivo "${file.name}" excede el límite de ${maxSizeMB} MB y no será subido.`);
        return;
      }
  
      const filePath = `images/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      this.uploadedFileNames.push(file.name);
  
      uploadTask.on('state_changed', {
        next: (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        error: (error) => console.error('Upload error:', error),
        complete: async () => {
          try {
            const downloadURL = await getDownloadURL(storageRef);
            this.uploadedImages.push(downloadURL);
            this.form.get('adjuntos')?.setValue([...this.uploadedImages]);
            event.target.value = '';
          } catch (error) {
            console.error('Error getting download URL:', error);
          }
        }
      });
    });
  }
  

  async saveImageMetadata(downloadURL: string, fileName: string) {
    const imagesCollection = collection(this.firestore, 'images');
    await addDoc(imagesCollection, {
      url: downloadURL,
      name: fileName,
      uploadedAt: new Date()
    });
  }

  removeFile(index: number): void {
    const fileArray: string[] = this.form.get('adjuntos')?.value || [];
    
    fileArray.splice(index, 1);
  
    this.form.get('adjuntos')?.setValue(fileArray);
  }
  trackByFn(index: number, item: string): string {
    return item; 
  }

  get adjuntosControl() {
    return this.form.get('adjuntos');
  }
}
