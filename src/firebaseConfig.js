// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsnmsksDqHmQB-qjgkxXaGXO_cAMgcRSc",
  authDomain: "meu-projeto-80ead.firebaseapp.com",
  projectId: "meu-projeto-80ead",
  storageBucket: "meu-projeto-80ead.firebasestorage.app",
  messagingSenderId: "1002815722396",
  appId: "1:1002815722396:web:e1ee2af0e304c660d0ae59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);