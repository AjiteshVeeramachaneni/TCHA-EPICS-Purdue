/**
 * Firebase Configuration and Initialization
 */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1Bnqs74i1g4Rx78Y4OxQZcP7rhByzJfA",
  authDomain: "tcha-bfc71.firebaseapp.com",
  projectId: "tcha-bfc71",
  storageBucket: "tcha-bfc71.firebasestorage.app",
  messagingSenderId: "719395909531",
  appId: "1:719395909531:web:e69d790a6746c7d6433b3e",
  measurementId: "G-2TXZ1VX1BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Firebase tests
 * - Firebase stores in "collections" and "documents"
 *   - Collections are sections of data
 *   - Documents are individual data points stored with key-value pairs
 * - Collections can be at root or stored inside a document
 *   - For example a "users" collection with user documents that also
 *     have "orders" collections for each user
 */

// Write 1st user to the collection named "users"
try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Ada",
    last: "Lovelace",
    born: 1815
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}

try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Alan",
    middle: "Mathison",
    last: "Turing",
    born: 1912
  });

  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}

const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  console.log(doc.id, "=>", doc.data());
});
