
import './App.css'
import { BrowserRouter, Navigate, Routes, Route, useParams } from "react-router-dom";
import Homepage from './Components/Homepage'
import MainLayout from './Components/MainLayout';
import ProtectedRoute from './Components/ProtectedRoute';
import WriteReview from './Components/WriteReview';
import ReviewDetail from './Components/ReviewDetail';
import About from './Components/About';
import Login from './AuthComponent/Login';
import SignUp from './AuthComponent/SignUp';
import VerifyOtp from './AuthComponent/VerifyOtp';
import Profile from './Components/Profile';
import ReviewPage from './Components/ReviewPage';
import ScrollToTop from './Components/ScrollToTop';

function ReviewAliasRedirect({ mode = "list" }) {
  const { id } = useParams();

  if (mode === "detail" && id) {
    return <Navigate to={`/review/${id}`} replace />;
  }

  if (mode === "edit" && id) {
    return <Navigate to={`/review/${id}/edit`} replace />;
  }

  return <Navigate to="/review" replace />;
}



function App() {
  return (
    

       <BrowserRouter>
       <ScrollToTop/>
      <Routes>
        
        {/* Routes WITH navbar + footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/review" element={<ReviewPage/>} />
          <Route path="/reviews" element={<ReviewAliasRedirect />} />
          <Route path="/reviews/:id" element={<ReviewAliasRedirect mode="detail" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/write-review" element={<WriteReview />} />
            <Route path="/review/:id/edit" element={<WriteReview />} />
            <Route path="/reviews/:id/edit" element={<ReviewAliasRedirect mode="edit" />} />
            <Route path="/profile" element={<Profile/>} />
          </Route>
        </Route>

        {/* Route WITHOUT navbar + footer */}
        <Route path="/auth" element={<Login />} />
        <Route path="/auth/signup" element={<SignUp/>} />
        <Route path="/auth/verify-otp" element={<VerifyOtp />} />

      </Routes>
    </BrowserRouter>

  )
}

export default App
