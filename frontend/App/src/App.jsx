
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from './Components/Footer'
import Homepage from './Components/Homepage'
import Navbar from './Components/Navbar'
import WriteReview from './Components/WriteReview';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/write-review" element={<WriteReview/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
      
    </>
  )
}

export default App
