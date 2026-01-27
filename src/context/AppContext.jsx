import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [requisitions, setRequisitions] = useState([]);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
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

        // Real-time listener for invoices
        const qInvoices = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
        const unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
            const invoicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInvoices(invoicesData);
        }, (error) => {
            console.error("Error fetching invoices:", error);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeCompanies();
            unsubscribeEmployees();
            unsubscribeDepartments();
            unsubscribeRequisitions();
            unsubscribeInvoices();
        };
    }, []);

    const addCompany = async (company) => {
        try {
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000);
            const registrationNumber = `EMS-${year}-${random}`;

            await addDoc(collection(db, 'companies'), {
                ...company,
                registrationNumber,
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

    const addRequisition = async (requisition) => {
        try {
            await addDoc(collection(db, 'requisitions'), {
                status: 'pending_leader',
                ...requisition,
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

    const addInvoice = async (invoice) => {
        try {
            await addDoc(collection(db, 'invoices'), {
                status: 'Draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...invoice
            });
        } catch (error) {
            console.error("Error adding invoice:", error);
            throw error;
        }
    };

    const updateInvoice = async (id, updatedData) => {
        try {
            const invoiceRef = doc(db, 'invoices', id);
            await updateDoc(invoiceRef, {
                ...updatedData,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating invoice:", error);
            throw error;
        }
    };

    const deleteInvoice = async (id) => {
        try {
            await deleteDoc(doc(db, 'invoices', id));
        } catch (error) {
            console.error("Error deleting invoice:", error);
            throw error;
        }
    };

    const uploadFile = async (file, path) => {
        try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    /**
     * Uploads a file to an external PHP server
     * @param {File} file The file to upload
     * @param {Function} onProgress Optional callback for progress updates
     * @returns {Promise<string>} The URL of the uploaded file
     */
    const uploadToExternalServer = (file, onProgress) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);

            const ENDPOINT = 'https://unimarket-mw.com/ems/upload.php';
            const xhr = new XMLHttpRequest();

            xhr.open('POST', ENDPOINT, true);

            if (onProgress) {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (data.success && data.url) {
                            resolve(data.url);
                        } else {
                            reject(new Error(data.message || 'Unknown server error'));
                        }
                    } catch (e) {
                        reject(new Error('Failed to parse server response'));
                    }
                } else {
                    reject(new Error('Server upload failed with status ' + xhr.status));
                }
            };

            xhr.onerror = () => reject(new Error('Network error or CORS issue'));
            xhr.send(formData);
        });
    };

    const updateUserProfile = async (id, updatedData) => {
        try {
            const employeeRef = doc(db, 'employees', id);
            await updateDoc(employeeRef, {
                ...updatedData,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error updating profile:", error);
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
            requisitions,
            addRequisition,
            updateRequisition,
            deleteRequisition,
            invoices,
            addInvoice,
            updateInvoice,
            deleteInvoice,
            uploadFile,
            uploadToExternalServer,
            updateUserProfile,
            user,
            userData,
            login,
            logout,
            loading
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
