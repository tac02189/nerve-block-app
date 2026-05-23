import { initializeApp } from "firebase/app";

// Scaffolded for future use (Analytics / Firestore / Auth). v1 ships static.
// Replace this placeholder config after running `firebase init` for the
// `mizzou-nerve-blocks` project. The values below are public identifiers,
// not secrets, but they must match the real Firebase project before deploy.
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "mizzou-nerve-blocks.firebaseapp.com",
  projectId: "mizzou-nerve-blocks",
  storageBucket: "mizzou-nerve-blocks.firebasestorage.app",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = initializeApp(firebaseConfig);
export default app;
