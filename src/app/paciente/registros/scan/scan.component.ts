import { Component, HostListener } from '@angular/core';
import {
  ReactiveFormsModule
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { LabelComponent } from 'src/app/shared/ui/label/label.component';
import { BadgeComponent } from 'src/app/shared/ui/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component'
import { QrService } from 'src/app/core/services/qr.service';

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
    ButtonComponent
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
    // setTimeout()
    this.router.navigate(['/registrar']);
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
    this.isMobile = width < 980;
    // this.updateViewState(this.router.url);
  }

  // updateViewState(url: string): void {
  //   this.isDetailView = url.includes('/item/');
  //   this.isScanView = url.includes('/scan');
  //   this.isRegistroView = url.includes('/register');
  // }

  cancel() {
    this.qrRegistro = !this.qrRegistro;
  }
}
