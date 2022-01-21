import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "@firebase/storage";
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAMJbLHscz5AIoAk_sDgKj5HQ35Rxg1wK8",
  authDomain: "requiem-collective.firebaseapp.com",
  projectId: "requiem-collective",
  storageBucket: "requiem-collective.appspot.com",
  messagingSenderId: "533584097808",
  appId: "1:533584097808:web:95b33b21133b56f57e1095"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)