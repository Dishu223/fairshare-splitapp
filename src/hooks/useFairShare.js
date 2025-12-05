import { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion } from 'firebase/firestore';

export function useFairShare(user) {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen for updates from Firestore whenever the user changes
  useEffect(() => {
    if (!user) {
      setGroups([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');

    // Subscribe to Groups
    const unsubGroups = onSnapshot(groupsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort newest first
      setGroups(data.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    // Subscribe to Expenses
    const unsubExpenses = onSnapshot(expensesRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => {
      unsubGroups();
      unsubExpenses();
    };
  }, [user]);

  // Helper functions to keep the UI clean
  const createGroup = async (groupName) => {
    if (!groupName.trim() || !user) return;
    return await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'groups'), {
      name: groupName,
      createdBy: user.uid,
      createdAt: Date.now(),
      type: 'Custom',
      members: ['You']
    });
  };

  const addMember = async (groupId, memberName) => {
    if (!memberName.trim() || !groupId) return;
    const groupRef = doc(db, 'artifacts', appId, 'public', 'data', 'groups', groupId);
    await updateDoc(groupRef, { members: arrayUnion(memberName.trim()) });
  };

  const addTransaction = async (groupId, txMode, form) => {
    const now = new Date();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
      groupId,
      type: txMode,
      desc: txMode === 'expense' ? form.desc : 'Settlement',
      amount: parseFloat(form.amount),
      payer: form.payer,
      receiver: txMode === 'settlement' ? form.receiver : null,
      splitType: txMode === 'expense' ? form.splitType : null,
      splits: txMode === 'expense' && form.splitType === 'unequal' ? form.customSplits : null,
      createdBy: user.uid,
      createdAt: Date.now(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      deleted: false
    });
  };

  const deleteTransaction = async (id) => {
    // Soft delete so we can restore if needed later
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id), { deleted: true });
  };

  const deleteGroup = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', id));
  };

  return { 
    groups, 
    expenses, 
    loading, 
    createGroup, 
    addMember, 
    addTransaction, 
    deleteTransaction, 
    deleteGroup 
  };
}