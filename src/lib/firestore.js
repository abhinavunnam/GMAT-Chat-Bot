import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, doc } from "firebase/firestore";

import { initializeApp } from 'firebase/app';
const firebaseConfig = {
    apiKey: "AIzaSyCtG2MynZAIu366TNrJIQkulsmUVcJb7SE",
    authDomain: "gmatchatbot.firebaseapp.com",
    projectId: "gmatchatbot",
    storageBucket: "gmatchatbot.firebasestorage.app",
    messagingSenderId: "289644806117",
    appId: "1:289644806117:web:5049934f44b1738d9cb90c",
    measurementId: "G-NLR3JE9XP4"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MAX_MESSAGES = 50;

// Function to add a message to Firestore
export const addMessage = async (sessionId, text, sender) => {
    const messagesRef = collection(db, `chatSessions/${sessionId}/messages`);
    
    // Add message to Firestore with server timestamp
    await addDoc(messagesRef, {
        text,
        sender,
        timestamp: serverTimestamp()
    });

    // Check and enforce the message limit
    await enforceMessageLimit(sessionId);
};

// Function to fetch messages from Firestore
export const getMessages = async (sessionId) => {
    const messagesRef = collection(db, `chatSessions/${sessionId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(MAX_MESSAGES));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
};

// Function to enforce the message limit
const enforceMessageLimit = async (sessionId) => {
    const messagesRef = collection(db, `chatSessions/${sessionId}/messages`);
    const q = query(messagesRef, orderBy("timestamp"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.size > MAX_MESSAGES) {
        const excessMessages = querySnapshot.docs.slice(0, querySnapshot.size - MAX_MESSAGES);
        excessMessages.forEach(async (message) => {
            await deleteDoc(doc(db, `chatSessions/${sessionId}/messages/${message.id}`));
        });
    }
};

// Function to clear session history
export const clearSessionHistory = async (sessionId) => {
    const messagesRef = collection(db, `chatSessions/${sessionId}/messages`);
    const querySnapshot = await getDocs(messagesRef);
    
    querySnapshot.forEach(async (message) => {
        await deleteDoc(doc(db, `chatSessions/${sessionId}/messages/${message.id}`));
    });
};