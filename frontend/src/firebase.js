import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC1mYJyLc4xSITS62z1ii7HkD5Mco1OAww",
  authDomain: "react-todo-e98af.firebaseapp.com",
  projectId: "react-todo-e98af",
  storageBucket: "react-todo-e98af.appspot.com",
  messagingSenderId: "812823989942",
  appId: "1:812823989942:web:2e0b7b43b4fe5cb430e017"
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export default firebase;
