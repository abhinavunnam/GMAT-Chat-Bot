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

// const enforceConversationLimit = async (sessionId) => {
//     const conversationsRef = collection(db, `chatSessions/${sessionId}/conversations`);
//     const q = query(conversationsRef, orderBy("timestamp"));
//     const querySnapshot = await getDocs(q);
    
//     if (querySnapshot.size > MAX_CONVERSATIONS) {
//         const excessConversations = querySnapshot.docs.slice(0, querySnapshot.size - MAX_CONVERSATIONS);
//         for (const conversation of excessConversations) {
//             await deleteDoc(doc(db, `chatSessions/${sessionId}/conversations/${conversation.id}`));
//         }
//     }
// };

// export const clearSessionHistory = async (sessionId) => {
//     const conversationsRef = collection(db, `chatSessions/${sessionId}/conversations`);
//     const querySnapshot = await getDocs(conversationsRef);
    
//     for (const conversation of querySnapshot.docs) {
//         await deleteDoc(doc(db, `chatSessions/${sessionId}/conversations/${conversation.id}`));
//     }
// };