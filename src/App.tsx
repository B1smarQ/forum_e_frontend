import {BrowserRouter, Route, Routes} from "react-router-dom"
import './App.css'
import Home from "./components/Home"
import NotFound from "./components/NotFoundPage/NotFound.jsx";
import PostPage from "./components/PostPage/PostPage.tsx";
import RegisterPage from "./components/RegisterPage/RegisterPage.tsx";
import LoginPage from "./components/LoginPage/LoginPage.tsx";
import PostCreationPage from "./components/PostCreationPage/PostCreationPage.tsx";
import CommunitiesPage from "./components/CommunitiesPage/CommunitiesPage.tsx";
import CommunityCreationPage from "./components/CommunityCreationPage/CommunityCreationPage.tsx";
import CommunityPage from "./components/CommunityPage/CommunityPage.tsx";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage.tsx";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/post/:id" element={<PostPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/create-post" element={<PostCreationPage/>}/>
          <Route path="/communities" element={<CommunitiesPage/>}/>
          <Route path="/create-community" element={<CommunityCreationPage/>}/>
          <Route path="/community/:id" element={<CommunityPage/>}/>
          <Route path="/user/:userId" element={<UserProfilePage/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>  
    </>
  )
}

export default App
