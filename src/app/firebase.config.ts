import { EnvironmentProviders, isDevMode } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage'

// PRODUCTION ENVIRONMENT CONFIG
// const firebaseProviders: EnvironmentProviders[] = [
//   provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
//   provideFirestore(() => getFirestore()),
//   provideAuth(() => getAuth()),
//   provideStorage(() => getStorage()),
// ];

// export { firebaseProviders };


// DEV ENVIRONMENT CONFIG (UNCOMMENT FOR LOCAL DEVELOPMENT WITH EMULATORS)
const firebaseProviders: EnvironmentProviders[] = [
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideFirestore(() => {
    const firestore = getFirestore();
    console.log('isDevMode:', isDevMode());
    if (isDevMode()) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
    return firestore;
  }),
  provideAuth(() => {
    const auth = getAuth();
    if (isDevMode()) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    return auth;
  }),
  provideStorage(() => getStorage()),
];

export { firebaseProviders };