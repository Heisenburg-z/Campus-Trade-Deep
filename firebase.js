// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAB9eAB7Trvmg6QgAiet5UYWUupci9a2bg",
  authDomain: "portfolio-43d9b.firebaseapp.com",
  projectId: "portfolio-43d9b",
  storageBucket: "portfolio-43d9b.firebasestorage.app",
  messagingSenderId: "885258878009",
  appId: "1:885258878009:web:275bc2ac6cacc22a43a1e8",
  measurementId: "G-MLBDFB6SX8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// Upload project image
export const uploadProjectImage = async (file, projectId) => {
  if (!file) return null;
  
  try {
    // Create a storage reference
    const imageRef = ref(storage, `projects/${projectId}/${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Get all project images
export const getProjectImages = async (projectId) => {
  try {
    const projectRef = ref(storage, `projects/${projectId}`);
    const result = await listAll(projectRef);
    
    // Get download URLs for all items
    const urls = await Promise.all(
      result.items.map(item => getDownloadURL(item))
    );
    
    return urls;
  } catch (error) {
    console.error("Error getting project images:", error);
    throw error;
  }
};

export { storage, app };