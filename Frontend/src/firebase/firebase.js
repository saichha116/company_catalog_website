import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSem5qe_1m8KvbOBwaLHwXhGh_JJK8LaQ",
  authDomain: "design-and-printing-ff3ed.firebaseapp.com",
  projectId: "design-and-printing-ff3ed",
  storageBucket: "design-and-printing-ff3ed.firebasestorage.app",
  messagingSenderId: "774555779601",
  appId: "1:774555779601:web:67b4e17239126c802467b0",
  measurementId: "G-WX7CNG9VTQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

export default app;
