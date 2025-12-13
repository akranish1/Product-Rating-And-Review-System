
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from './Components/Footer'
import Homepage from './Components/Homepage'
import Navbar from './Components/Navbar'
import WriteReview from './Components/WriteReview';
import ReviewDetail from './Components/ReviewDetail';
import About from './Components/About';



function App() {
  return (

      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/write-review" element={<WriteReview/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/review/:id" element={<ReviewDetail/>} />
        </Routes>
        <Footer />
      </BrowserRouter>

  )
}

export default App
