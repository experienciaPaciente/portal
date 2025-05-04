import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('fileInput') fileInput!: ElementRef;

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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.form.get('adjuntos')?.value.forEach(url => URL.revokeObjectURL(url));
  }

  onTitleChange() {
    // this.editableTitle = this.form.controls['titulo'].value;
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

  // considerar utilizar un enum o crear una colección para especialidades
  categorias: string[] = [
    'Medicina General',
    'Pediatría',
    'Ginecología y Obstetricia',
    'Cardiología',
    'Dermatología',
    'Neurología',
    'Psiquiatría',
    'Endocrinología',
    'Gastroenterología',
    'Traumatología y Ortopedia',
    'Oftalmología',
    'Otorrinolaringología',
    'Urología',
    'Neumología',
    'Oncología',
    'Nutrición y Dietética',
    'Fisiatría y Rehabilitación',
    'Odontología'
  ];
  
  categoriaMap: { [key: string]: { icon: string; color: string } } = {
    'Medicina General': { icon: 'user-md', color: '#007bff' }, // Blue
    'Pediatría': { icon: 'baby', color: '#28a745' }, // Green
    'Ginecología y Obstetricia': { icon: 'venus', color: '#e83e8c' }, // Pink
    'Cardiología': { icon: 'heart', color: '#dc3545' }, // Red
    'Dermatología': { icon: 'spa', color: '#fd7e14' }, // Orange
    'Neurología': { icon: 'brain', color: '#6f42c1' }, // Purple
    'Psiquiatría': { icon: 'comments', color: '#20c997' }, // Teal
    'Endocrinología': { icon: 'balance-scale', color: '#ffc107' }, // Yellow
    'Gastroenterología': { icon: 'stethoscope', color: '#795548' }, // Brown
    'Traumatología y Ortopedia': { icon: 'crutch', color: '#6c757d' }, // Gray
    'Oftalmología': { icon: 'eye', color: '#17a2b8' }, // Cyan
    'Otorrinolaringología': { icon: 'head-side-cough', color: '#6610f2' }, // Indigo
    'Urología': { icon: 'x-ray', color: '#007bff' }, // Blue
    'Neumología': { icon: 'lungs', color: '#87ceeb' }, // Light Blue
    'Oncología': { icon: 'ribbon', color: '#6f42c1' }, // Purple
    'Nutrición y Dietética': { icon: 'utensils', color: '#a2d729' }, // Lime
    'Fisiatría y Rehabilitación': { icon: 'dumbbell', color: '#fd7e14' }, // Orange
    'Odontología': { icon: 'tooth', color: '#ffffff' } // White
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
      }
    } catch (error) {
      console.error('Error loading registro:', error);
    }
  }
  
  async createRegistro() {
    const user = await this.auth.currentUser;
  
    if (this.form.invalid) return;
  
    try {
      const registro = this.form.value as Registro;
  
      // Adjuntos array (removes any invalid entries)
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
    
    Array.from(files).forEach((file: File) => {
      const filePath = `images/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      this.uploadedFileNames.push(file.name);
      
      uploadTask.on('state_changed', {
        next: (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // You can use progress for displaying upload status if needed
        },
        error: (error) => {
          console.error('Upload error:', error);
          // Remove the file name if upload fails
          const index = this.uploadedFileNames.findIndex(name => name === file.name);
          if (index !== -1) {
            this.uploadedFileNames.splice(index, 1);
          }
        },
        complete: async () => {
          try {
            const downloadURL = await getDownloadURL(storageRef);
            this.uploadedImages.push(downloadURL);
            
            // Update the form control with the current array of image URLs
            this.form.controls.adjuntos.setValue([...this.uploadedImages]);
            
            // Save metadata if needed
            await this.saveImageMetadata(downloadURL, file.name);
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
