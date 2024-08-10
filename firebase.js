

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzXOSCPYgivsQyJzvzMq5gHJd7vfT3FZo",
  authDomain: "pantry-project-b53f0.firebaseapp.com",
  projectId: "pantry-project-b53f0",
  storageBucket: "pantry-project-b53f0.appspot.com",
  messagingSenderId: "351554984526",
  appId: "1:351554984526:web:43196210187ca2cff2c11f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);


export {firestore, storage}