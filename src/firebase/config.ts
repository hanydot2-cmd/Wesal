import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfr2mltWsy3k4hXoboTcOt_3iH1MrSxf8",
  authDomain: "wesal-app-dbfcc.firebaseapp.com",
  projectId: "wesal-app-dbfcc",
  storageBucket: "wesal-app-dbfcc.firebasestorage.app",
  messagingSenderId: "631586649675",
  appId: "1:631586649675:web:a49329c12e9bce5933bfce",
  measurementId: "G-HJX475LL97"
};

// تهيئة Firebase مرة واحدة فقط لمشروع wesal-app-dbfcc
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
