import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT'
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false, error: null };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.LOGOUT:
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  user: null,
  loading: true,
  error: null
};

// Generate unique 6-digit alphanumeric code
const generateTeamCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Register Manager
  const registerManager = async (email, password, name) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate unique team code
      let teamCode;
      let codeExists = true;
      
      // Ensure code is unique
      while (codeExists) {
        teamCode = generateTeamCode();
        const codeQuery = query(
          collection(db, 'managers'), 
          where('teamCode', '==', teamCode)
        );
        const codeSnapshot = await getDocs(codeQuery);
        codeExists = !codeSnapshot.empty;
      }

      // Save manager data
      const managerData = {
        name,
        email,
        teamCode,
        userType: 'manager',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'managers', user.uid), managerData);

      // Update user state
      dispatch({ 
        type: AUTH_ACTIONS.SET_USER, 
        payload: { ...user, ...managerData } 
      });

      return { success: true, teamCode };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Register Labor
  const registerLabor = async (email, password, name, managerCode) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Validate manager code
      const managerQuery = query(
        collection(db, 'managers'), 
        where('teamCode', '==', managerCode)
      );
      const managerSnapshot = await getDocs(managerQuery);

      if (managerSnapshot.empty) {
        throw new Error('Código do manager inválido');
      }

      const managerDoc = managerSnapshot.docs[0];
      const managerId = managerDoc.id;

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save labor data
      const laborData = {
        name,
        email,
        managerId,
        managerCode,
        userType: 'labor',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'labors', user.uid), laborData);

      // Update user state
      dispatch({ 
        type: AUTH_ACTIONS.SET_USER, 
        payload: { ...user, ...laborData } 
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      let userData = null;
      
      // Check if user is a manager
      const managerDoc = await getDoc(doc(db, 'managers', user.uid));
      if (managerDoc.exists()) {
        userData = { ...user, ...managerDoc.data() };
      } else {
        // Check if user is a labor
        const laborDoc = await getDoc(doc(db, 'labors', user.uid));
        if (laborDoc.exists()) {
          userData = { ...user, ...laborDoc.data() };
        }
      }

      if (!userData) {
        throw new Error('Dados do usuário não encontrados');
      }

      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Regenerate team code (for managers)
  const regenerateTeamCode = async () => {
    try {
      if (!state.user || state.user.userType !== 'manager') {
        throw new Error('Apenas managers podem regenerar códigos');
      }

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // Generate new unique code
      let newTeamCode;
      let codeExists = true;
      
      while (codeExists) {
        newTeamCode = generateTeamCode();
        const codeQuery = query(
          collection(db, 'managers'), 
          where('teamCode', '==', newTeamCode)
        );
        const codeSnapshot = await getDocs(codeQuery);
        codeExists = !codeSnapshot.empty;
      }

      // Update manager document
      await setDoc(doc(db, 'managers', state.user.uid), {
        ...state.user,
        teamCode: newTeamCode
      }, { merge: true });

      // Update user state
      dispatch({ 
        type: AUTH_ACTIONS.SET_USER, 
        payload: { ...state.user, teamCode: newTeamCode } 
      });

      return { success: true, teamCode: newTeamCode };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          let userData = null;
          
          // Check if user is a manager
          const managerDoc = await getDoc(doc(db, 'managers', user.uid));
          if (managerDoc.exists()) {
            userData = { ...user, ...managerDoc.data() };
          } else {
            // Check if user is a labor
            const laborDoc = await getDoc(doc(db, 'labors', user.uid));
            if (laborDoc.exists()) {
              userData = { ...user, ...laborDoc.data() };
            }
          }

          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
        } catch (error) {
          dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    registerManager,
    registerLabor,
    login,
    logout,
    regenerateTeamCode,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

