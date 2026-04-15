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
  friends?: string[]; // array of UIDs
};

export type StudySession = {
  id?: string;
  userUid: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  minutes: number;
  timestamp: any;
  dateStr?: string; // YYYY-MM-DD for easy daily grouping
};

export type UserSettings = {
  playlists: string[];
  theme: string;
  lastModified: number;
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
        lastActive: data.lastActive || Date.now(),
        friends: data.friends || []
      });
    });
    return users;
  },

  getUser: async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        uid: docSnap.id, 
        displayName: data.displayName || 'Guest',
        email: data.email || '',
        photoURL: data.photoURL,
        country: data.country || 'Earth',
        major: data.major || 'General Studies',
        studyTime: data.studyTime || 0,
        sessions: data.sessions || 0,
        lastActive: data.lastActive || Date.now(),
        friends: data.friends || []
      } as UserProfile;
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

  // --- Friends System ---
  addFriend: async (userUid: string, friendUid: string) => {
    // Bi-directional friend add (simple version)
    const userRef = doc(firestore, 'users', userUid);
    const friendRef = doc(firestore, 'users', friendUid);
    
    // Get current friends first to avoid duplicates
    const userSnap = await getDoc(userRef);
    const friendSnap = await getDoc(friendRef);
    
    if (userSnap.exists() && friendSnap.exists()) {
      const userFriends = userSnap.data().friends || [];
      const friendFriends = friendSnap.data().friends || [];
      
      if (!userFriends.includes(friendUid)) {
        await setDoc(userRef, { friends: [...userFriends, friendUid] }, { merge: true });
      }
      if (!friendFriends.includes(userUid)) {
        await setDoc(friendRef, { friends: [...friendFriends, userUid] }, { merge: true });
      }
    }
  },

  removeFriend: async (userUid: string, friendUid: string) => {
    const userRef = doc(firestore, 'users', userUid);
    const friendRef = doc(firestore, 'users', friendUid);
    
    const userSnap = await getDoc(userRef);
    const friendSnap = await getDoc(friendRef);
    
    if (userSnap.exists() && friendSnap.exists()) {
      const userFriends = userSnap.data().friends || [];
      const friendFriends = friendSnap.data().friends || [];
      
      await setDoc(userRef, { friends: userFriends.filter((f: string) => f !== friendUid) }, { merge: true });
      await setDoc(friendRef, { friends: friendFriends.filter((f: string) => f !== userUid) }, { merge: true });
    }
  },

  // --- Sessions ---
  addSession: async (session: Omit<StudySession, 'id' | 'timestamp' | 'dateStr'>) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    await addDoc(collection(firestore, 'sessions'), {
      ...session,
      timestamp: Timestamp.now(),
      dateStr
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

  // --- Playlists & Settings ---
  saveUserSettings: async (uid: string, settings: Partial<UserSettings>) => {
    await setDoc(doc(firestore, 'userSettings', uid), {
      ...settings,
      lastModified: Date.now()
    }, { merge: true });
  },

  getUserSettings: async (uid: string): Promise<UserSettings | null> => {
    const docSnap = await getDoc(doc(firestore, 'userSettings', uid));
    if (docSnap.exists()) return docSnap.data() as UserSettings;
    return { playlists: [], theme: 'default', lastModified: Date.now() };
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
  saveNote: async (uid: string, note: { id: string, title: string, content: string }) => {
    const noteId = note.id || `note_${Date.now()}`;
    await setDoc(doc(firestore, `users/${uid}/notes`, noteId), {
      ...note,
      id: noteId,
      lastSaved: Date.now()
    });
    
    // Also sync to virtual file system
    await setDoc(doc(firestore, `users/${uid}/files`, noteId), {
      id: noteId,
      name: note.title + '.sfn', // Study FM Note
      type: 'application/x-studyfm-note',
      size: note.content.length,
      uploadDate: Date.now(),
      storagePath: `virtual/notes/${noteId}`,
    });
  },

  getNotes: async (uid: string): Promise<any[]> => {
    const querySnapshot = await getDocs(collection(firestore, `users/${uid}/notes`));
    const notes: any[] = [];
    querySnapshot.forEach((doc) => {
      notes.push(doc.data());
    });
    return notes;
  },

  getNote: async (uid: string, noteId: string): Promise<any | null> => {
    const docSnap = await getDoc(doc(firestore, `users/${uid}/notes`, noteId));
    return docSnap.exists() ? docSnap.data() : null;
  },

  deleteNote: async (uid: string, noteId: string) => {
    await deleteDoc(doc(firestore, `users/${uid}/notes`, noteId));
    await deleteDoc(doc(firestore, `users/${uid}/files`, noteId));
  },

  // --- Syllabus ---
  saveSyllabus: async (uid: string, syllabus: any[]) => {
    await setDoc(doc(firestore, 'userSyllabus', uid), {
      subjects: syllabus,
      lastUpdated: Date.now()
    });
  },

  getSyllabus: async (uid: string): Promise<any[] | null> => {
    const docSnap = await getDoc(doc(firestore, 'userSyllabus', uid));
    return docSnap.exists() ? docSnap.data().subjects : null;
  },

  // --- Active Topic Persistence ---
  saveActiveTopic: async (uid: string, topic: any | null) => {
    await setDoc(doc(firestore, 'activeTopic', uid), {
      topic,
      startTime: topic ? Date.now() : null
    });
  },

  getActiveTopic: async (uid: string): Promise<{ topic: any, startTime: number } | null> => {
    const docSnap = await getDoc(doc(firestore, 'activeTopic', uid));
    if (docSnap.exists()) return docSnap.data() as any;
    return null;
  },

  // --- Files Metadata ---
  saveFileMetadata: async (uid: string, fileInfo: any) => {
    await setDoc(doc(firestore, `users/${uid}/files`, fileInfo.id), {
      ...fileInfo,
      lastModified: Date.now()
    });
  },

  getFileMetadata: async (uid: string): Promise<any[]> => {
    const querySnapshot = await getDocs(collection(firestore, `users/${uid}/files`));
    const files: any[] = [];
    querySnapshot.forEach((doc) => {
      files.push(doc.data());
    });
    return files;
  },

  deleteFileMetadata: async (uid: string, fileId: string) => {
    await deleteDoc(doc(firestore, `users/${uid}/files`, fileId));
  }
};



