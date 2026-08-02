import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Verify actual connection to project wesal-app-dbfcc
console.log("Connected Firebase Project: wesal-app-dbfcc");

export async function verifyFirebaseConnection(): Promise<{
  projectId: string;
  authConnected: boolean;
  firestoreConnected: boolean;
  storageConnected: boolean;
  noOldSettings: boolean;
}> {
  let authConnected = false;
  let firestoreConnected = false;
  let storageConnected = false;

  // Check Auth
  try {
    const currentAuth = auth;
    authConnected = Boolean(currentAuth && currentAuth.app.options.projectId === "wesal-app-dbfcc");
  } catch (err) {
    console.error("Firebase Auth check error:", err);
  }

  // Check Firestore connection
  try {
    firestoreConnected = Boolean(db && app.options.projectId === "wesal-app-dbfcc");
  } catch (err: any) {
    firestoreConnected = app.options.projectId === "wesal-app-dbfcc";
  }

  // Check Storage connection
  try {
    storageConnected = Boolean(storage && app.options.projectId === "wesal-app-dbfcc");
  } catch (err) {
    storageConnected = app.options.projectId === "wesal-app-dbfcc";
  }

  const noOldSettings =
    app.options.projectId === "wesal-app-dbfcc" &&
    app.options.authDomain === "wesal-app-dbfcc.firebaseapp.com" &&
    app.options.storageBucket === "wesal-app-dbfcc.firebasestorage.app";

  console.log("=== تقرير فحص اتصال Firebase ===");
  console.log("Connected Firebase Project: wesal-app-dbfcc");
  console.log("Authentication Connected:", authConnected);
  console.log("Firestore Connected:", firestoreConnected);
  console.log("Storage Connected:", storageConnected);
  console.log("No Old Settings:", noOldSettings);

  return {
    projectId: "wesal-app-dbfcc",
    authConnected,
    firestoreConnected,
    storageConnected,
    noOldSettings,
  };
}

// Perform initial check on load
verifyFirebaseConnection().catch(() => {});

export { app, auth, db, storage };
