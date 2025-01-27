import { useEffect, useRef, useState } from "react";
import './App.css'
import 'react-toastify/dist/ReactToastify.css'
import { getContacts, saveContact, updateContact, updatePhoto } from './api/ContactService'


import Contact from "./component/Contact";
import Header from "./component/Header";
import { Navigate, Route, Routes } from "react-router-dom";
import ContactList from "./component/ContactList";
import ContactDetail from "./component/ContactDetail";
import { toastError, toastSuccess, toastWarning } from "./api/ToastService";
import { ToastContainer } from "react-toastify";


function App() {
  const modalRef = useRef();
  const fileRef = useRef()
  const [data, setData] = useState({})
  const [currentPage, setCurrentPage] = useState(0)
  const [file, setFile] = useState(undefined);
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    title: '',
    status: ''
  })

  const getAllContacts = async (page = 0, size = 4) => {
    try {
      setCurrentPage(page)
      const { data } = await getContacts(page, size)
      setData(data)
      console.log(data);
      toastSuccess("Got all contacts")
    }
    catch (error) {
      console.log(error)
      toastError(error.message)
    }
  }

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value })
    console.log(values)
  }

  const toggleModal = (show) => show ? modalRef.current.showModal() : modalRef.current.close();

  const handleNewContact = async (event) => {
    event.preventDefault();
    try {
      const { data } = await saveContact(values)
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('id', data.id)
      const { data: photoUrl } = await updatePhoto(formData)
      toggleModal(false)
      console.log(photoUrl)
      setFile(undefined);
      fileRef.current.value = null;
      setValues({
        name: '',
        email: '',
        phone: '',
        address: '',
        title: '',
        status: ''
      })
      getAllContacts();
    }
    catch (error) {
      console.log(error)
      toastError(error.message)
    }
  }

  const updateContact = async (contact) => {
   try{
    const {data}=await saveContact(contact)
    console.log(data)
   }
   catch(error){
    console.log(error)
    toastError(error.message)

   }
  }

  const updateImage = async (formData) => {
   try{
    const {data: photoUrl} = await updatePhoto(formData)
   }
   catch(error){
    toastError(error.message)
   }
  }


  useEffect(() => {
    getAllContacts()
  }, [])

  return (
    <>
      <main className="main">
        <div className="container">
          <Header toggleModal={toggleModal} nbOfContacts={data.totalElements} />
          <Routes>
            <Route path="/" element={<Navigate to={'/contacts'} />} />
            <Route path="/contacts" element={<ContactList data={data} currentPage={currentPage} getAllContacts={getAllContacts} />} />
            <Route path="/contacts/:id" element={<ContactDetail updateContact={updateContact} updateImage={updateImage}/>} />
          </Routes>
        </div>
      </main>

      <dialog ref={modalRef} className="modal" id="modal">
        <div className="modal__header">
          <h3>New Contact</h3>
          <i onClick={() => toggleModal(false)} className="bi bi-x-lg"></i>
        </div>
        <div className="divider"></div>
        <div className="modal__body">
          <form onSubmit={handleNewContact}>
            <div className="user-details">
              <div className="input-box">
                <span className="details">Name</span>
                <input type="text" value={values.name} onChange={onChange} name='name' required />
              </div>
              <div className="input-box">
                <span className="details">Email</span>
                <input type="text" value={values.email} onChange={onChange} name='email' required />
              </div>
              <div className="input-box">
                <span className="details">Title</span>
                <input type="text" value={values.title} onChange={onChange} name='title' required />
              </div>
              <div className="input-box">
                <span className="details">Phone Number</span>
                <input type="text" value={values.phone} onChange={onChange} name='phone' required />
              </div>
              <div className="input-box">
                <span className="details">Address</span>
                <input type="text" value={values.address} onChange={onChange} name='address' required />
              </div>
              <div className="input-box">
                <span className="details">Account Status</span>
                <input type="text" value={values.status} onChange={onChange} name='status' required />
              </div>
              <div className="file-input">
                <span className="details">Profile Photo</span>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} ref={fileRef} name='photo' required />
              </div>
            </div>
            <div className="form_footer">
              <button onClick={() => toggleModal(false)} type='button' className="btn btn-danger">Cancel</button>
              <button type='submit' className="btn">Save</button>
            </div>
          </form>
        </div>
      </dialog>

      <ToastContainer/>


    </>
  );
}

export default App;
