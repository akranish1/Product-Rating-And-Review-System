
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './Components/Homepage'
import MainLayout from './Components/MainLayout';
import WriteReview from './Components/WriteReview';
import ReviewDetail from './Components/ReviewDetail';
import About from './Components/About';
import Login from './AuthComponent/Login';
import SignUp from './AuthComponent/SignUp';
import Profile from './Components/Profile';
import ReviewPage from './Components/ReviewPage';



function App() {
  return (

       <BrowserRouter>
      <Routes>

        {/* Routes WITH navbar + footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/write-review" element={<WriteReview />} />
          <Route path="/about" element={<About />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/review" element={<ReviewPage/>} />
        </Route>

        {/* Route WITHOUT navbar + footer */}
        <Route path="/auth" element={<Login />} />
        <Route path="/auth/SignUp" element={<SignUp/>} />

      </Routes>
    </BrowserRouter>

  )
}

export default App
