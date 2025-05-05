import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import {
  Auth,
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  updateProfile,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';

export interface Credential {
  name: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  grupoSanguineo: string;
  alergia: string;
  otraAlergia: string;
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  constructor(private firestore: Firestore) {}
  private auth: Auth = inject(Auth);
  readonly authState$ = authState(this.auth);
  errorMessage: string | null = null;

  async signUpWithEmailAndPassword(credential: Credential): Promise<void> {
    try {
        // Create the user with email and password
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
          this.auth,
          credential.email,
          credential.password
        );

        // Update the user's display name
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: `${credential.name} ${credential.lastName}`,
          });
      }
      

      // Save additional details to Firestore
      const userRef = doc(this.firestore, `users/${userCredential.user?.uid}`);
      await setDoc(userRef, {
        uid: userCredential.user?.uid,
        name: credential.name,
        lastName: credential.lastName,
        dni: credential.dni,
        email: credential.email,
        grupoSanguineo: credential.grupoSanguineo,
        alergia: credential.alergia,
        otraAlergia: credential.otraAlergia,
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'El correo ya está registrado.';
        console.error('Error creating user:', error);
        throw error;
      } else {
        this.errorMessage = 'Error al registrar el usuario.';
      }
    }
  }

  logInWithEmailAndPassword(credential: Credential) {
    return signInWithEmailAndPassword(
      this.auth,
      credential.email,
      credential.password
    );
  }

  logOut(): Promise<void> {
    return this.auth.signOut();
  }

  // providers
  signInWithGoogleProvider(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();

    return this.callPopUp(provider);
  }

  signInWithGithubProvider(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();

    return this.callPopUp(provider);
  }

  async callPopUp(provider: AuthProvider): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(this.auth, provider);

      return result;
    } catch (error: any) {
      return error;
    }
  }
}
