import { useState } from 'react';
import { auth, db } from '../../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

function AddEmployee() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create auth credentials
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Add employee to Firestore
      await addDoc(collection(db, 'employees'), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        createdAt: new Date()
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        department: ''
      });
      alert('Employee added successfully!');
    } catch (error) {
      alert('Error adding employee: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      {/* Add other form fields similarly */}
      <button type="submit">Add Employee</button>
    </form>
  );
}

export default AddEmployee;