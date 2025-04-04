import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, doc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "gmat-chat-bot.firebaseapp.com",
  projectId: "gmat-chat-bot",
  storageBucket: "gmat-chat-bot.appspot.app",
  messagingSenderId: "948998349188",
  appId: "1:948998349188:web:6e679510034664f9187dd1",
  measurementId: "G-PJ33S0CB4F"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MAX_CONVERSATIONS = 10;

export const addConversation = async (sessionId, userMessage, aiResponse, model, email) => {
    try {
        if (!userMessage?.trim()) return;
        
        const conversationsRef = collection(db, `chatSessions/${sessionId}/conversations`);
        await addDoc(conversationsRef, {
            email,
            userMessage,
            aiResponse,
            model,
            timestamp: serverTimestamp()
        });

        // await enforceConversationLimit(sessionId);
    } catch (error) {
        console.error('Error adding conversation:', error);
        throw error;
    }
};

export const getConversations = async (sessionId) => {
    const conversationsRef = collection(db, `chatSessions/${sessionId}/conversations`);
    const q = query(conversationsRef, orderBy("timestamp", "desc"), limit(MAX_CONVERSATIONS));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
};