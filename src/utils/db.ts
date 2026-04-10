import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db as firestore } from '../firebase';

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  country: string;
  major: string;
  studyTime: number; // minutes
  sessions: number;
  lastActive: number;
};

export type StudySession = {
  id?: string;
  userUid: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  minutes: number;
  timestamp: any;
};

export type CloudRoom = {
  id: string;
  name: string;
  subject: string;
  creator: string;
  activeUsers: string[];
  createdAt: any;
};

export type CloudMessage = {
  id: string;
  text: string;
  sender: string;
  timestamp: any;
};

export const db = {
  // --- Users ---
  getUsers: async (): Promise<UserProfile[]> => {
    const querySnapshot = await getDocs(collection(firestore, 'users'));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        displayName: data.displayName || 'Guest',
        email: data.email || '',
        photoURL: data.photoURL,
        country: data.country || 'Earth',
        major: data.major || 'General Studies',
        studyTime: data.studyTime || 0,
        sessions: data.sessions || 0,
        lastActive: data.lastActive || Date.now()
      });
    });
    return users;
  },

  getUser: async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { uid: docSnap.id, ...data } as UserProfile;
    }
    return null;
  },

  syncProfile: async (profile: Partial<UserProfile> & { uid: string }) => {
    const docRef = doc(firestore, 'users', profile.uid);
    await setDoc(docRef, {
      ...profile,
      lastActive: Date.now()
    }, { merge: true });
  },

  // --- Sessions ---
  addSession: async (session: Omit<StudySession, 'id' | 'timestamp'>) => {
    await addDoc(collection(firestore, 'sessions'), {
      ...session,
      timestamp: Timestamp.now()
    });

    const userRef = doc(firestore, 'users', session.userUid);
    await setDoc(userRef, {
      studyTime: increment(session.minutes),
      sessions: increment(1),
      lastActive: Date.now()
    }, { merge: true });
  },

  getUserSessions: async (uid: string): Promise<StudySession[]> => {
    const q = query(
      collection(firestore, 'sessions'), 
      where('userUid', '==', uid),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const sessions: StudySession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as StudySession);
    });
    return sessions;
  },

  // --- Rooms ---
  createRoom: async (room: Omit<CloudRoom, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(firestore, 'rooms'), {
      ...room,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  joinRoom: async (roomId: string, userName: string) => {
    const roomRef = doc(firestore, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return false;
    
    const activeUsers = roomSnap.data().activeUsers || [];
    if (!activeUsers.includes(userName)) {
      await setDoc(roomRef, {
        activeUsers: [...activeUsers, userName]
      }, { merge: true });
    }
    return true;
  },

  leaveRoom: async (roomId: string, userName: string) => {
    const roomRef = doc(firestore, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    
    const activeUsers = roomSnap.data().activeUsers || [];
    await setDoc(roomRef, {
      activeUsers: activeUsers.filter((u: string) => u !== userName)
    }, { merge: true });
  },

  sendMessage: async (roomId: string, message: Omit<CloudMessage, 'id' | 'timestamp'>) => {
    await addDoc(collection(firestore, `rooms/${roomId}/messages`), {
      ...message,
      timestamp: Timestamp.now()
    });
  },

  // --- Notes ---
  saveNotes: async (uid: string, content: string) => {
    await setDoc(doc(firestore, 'userNotes', uid), {
      content,
      lastSaved: Date.now()
    });
  },

  getNotes: async (uid: string): Promise<string | null> => {
    const docSnap = await getDoc(doc(firestore, 'userNotes', uid));
    return docSnap.exists() ? docSnap.data().content : null;
  }
};
