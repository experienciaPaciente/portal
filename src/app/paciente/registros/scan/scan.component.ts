import { Component } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BehaviorSubject } from 'rxjs';
import { ButtonComponent } from 'src/app/shared/ui/button/button.component';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [    
    // ReactiveFormsModule,
    // RouterLink,
    ZXingScannerModule,
    // LabelComponent,
    ButtonComponent
  ],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss'
})
export class ScanComponent {

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
}
