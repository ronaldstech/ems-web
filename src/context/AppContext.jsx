import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDocs } from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Stores extended profile (role, etc.)
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [requisitions, setRequisitions] = useState([]); // New State

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Fetch user profile from employees collection by authUid (Real-time)
                const q = query(collection(db, "employees"), where("authUid", "==", currentUser.uid));
                const unsubscribeUser = onSnapshot(q, (snapshot) => {
                    if (!snapshot.empty) {
                        const userDoc = snapshot.docs[0];
                        setUserData({ id: userDoc.id, ...userDoc.data() });
                    } else {
                        setUserData({ role: 'admin' });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                    setLoading(false);
                });
                return () => unsubscribeUser();
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        // Real-time listener for companies
        const qCompanies = query(collection(db, "companies"), orderBy("name"));
        const unsubscribeCompanies = onSnapshot(qCompanies, (snapshot) => {
            const companiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCompanies(companiesData);
        }, (error) => {
            console.error("Error fetching companies:", error);
        });

        // Real-time listener for employees
        const qEmployees = query(collection(db, "employees"), orderBy("lastName"));
        const unsubscribeEmployees = onSnapshot(qEmployees, (snapshot) => {
            const employeesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEmployees(employeesData);
        }, (error) => {
            console.error("Error fetching employees:", error);
        });

        // Real-time listener for departments
        const qDepartments = query(collection(db, "departments"), orderBy("name"));
        const unsubscribeDepartments = onSnapshot(qDepartments, (snapshot) => {
            const departmentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDepartments(departmentsData);
        }, (error) => {
            console.error("Error fetching departments:", error);
        });

        // Real-time listener for requisitions
        const qRequisitions = query(collection(db, "requisitions"), orderBy("createdAt", "desc"));
        const unsubscribeRequisitions = onSnapshot(qRequisitions, (snapshot) => {
            const reqsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequisitions(reqsData);
        }, (error) => {
            console.error("Error fetching requisitions:", error);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeCompanies();
            unsubscribeEmployees();
            unsubscribeDepartments();
            unsubscribeRequisitions();
        };
    }, []);

    const addCompany = async (company) => {
        try {
            // Generate automatic registration number: EMS-{YEAR}-{RANDOM}
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
            const registrationNumber = `EMS-${year}-${random}`;

            await addDoc(collection(db, 'companies'), {
                ...company,
                registrationNumber, // Overwrite/Ensure unique ID
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding company:", error);
            throw error;
        }
    };

    const updateCompany = async (id, updatedData) => {
        try {
            const companyRef = doc(db, 'companies', id);
            await updateDoc(companyRef, updatedData);
        } catch (error) {
            console.error("Error updating company:", error);
            throw error;
        }
    };

    const deleteCompany = async (id) => {
        try {
            await deleteDoc(doc(db, 'companies', id));
        } catch (error) {
            console.error("Error deleting company:", error);
            throw error;
        }
    };

    const addEmployee = async (employee) => {
        try {
            await addDoc(collection(db, 'employees'), {
                ...employee,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding employee:", error);
            throw error;
        }
    };

    const updateEmployee = async (id, updatedData) => {
        try {
            const employeeRef = doc(db, 'employees', id);
            await updateDoc(employeeRef, updatedData);
        } catch (error) {
            console.error("Error updating employee:", error);
            throw error;
        }
    };

    const deleteEmployee = async (id) => {
        try {
            await deleteDoc(doc(db, 'employees', id));
        } catch (error) {
            console.error("Error deleting employee:", error);
            throw error;
        }
    };

    const addDepartment = async (department) => {
        try {
            await addDoc(collection(db, 'departments'), {
                ...department,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding department:", error);
            throw error;
        }
    };

    const updateDepartment = async (id, updatedData) => {
        try {
            const deptRef = doc(db, 'departments', id);
            await updateDoc(deptRef, updatedData);
        } catch (error) {
            console.error("Error updating department:", error);
            throw error;
        }
    };

    const deleteDepartment = async (id) => {
        try {
            await deleteDoc(doc(db, 'departments', id));
        } catch (error) {
            console.error("Error deleting department:", error);
            throw error;
        }
    };

    // Requisition Operations
    const addRequisition = async (requisition) => {
        try {
            await addDoc(collection(db, 'requisitions'), {
                status: 'pending_leader', // Default
                ...requisition,           // Allow override
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding requisition:", error);
            throw error;
        }
    };

    const updateRequisition = async (id, updatedData) => {
        try {
            const reqRef = doc(db, 'requisitions', id);
            await updateDoc(reqRef, {
                ...updatedData,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating requisition:", error);
            throw error;
        }
    };

    const deleteRequisition = async (id) => {
        try {
            await deleteDoc(doc(db, 'requisitions', id));
        } catch (error) {
            console.error("Error deleting requisition:", error);
            throw error;
        }
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: 'hsl(var(--primary))' }}>Loading...</div>;
    }

    return (
        <AppContext.Provider value={{
            companies,
            addCompany,
            updateCompany,
            deleteCompany,
            employees,
            addEmployee,
            updateEmployee,
            deleteEmployee,
            departments,
            addDepartment,
            updateDepartment,
            deleteDepartment,
            requisitions, // Export state
            addRequisition, // Export CRUD
            updateRequisition, // Export CRUD
            deleteRequisition, // Export CRUD
            user,
            userData, // Expose extended profile
            login,
            logout,
            loading
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
