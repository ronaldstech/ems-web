import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyAZpCH9yZMwzQOLI8-QTT7xkJvDCRl4xng",
    authDomain: "ems1-9ffda.firebaseapp.com",
    projectId: "ems1-9ffda",
    storageBucket: "ems1-9ffda.firebasestorage.app",
    messagingSenderId: "57613015272",
    appId: "1:57613015272:web:b236f759f98fdb7099915d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
