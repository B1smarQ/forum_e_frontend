import {BrowserRouter, Route, Routes} from "react-router-dom"
import './App.css'
import Home from "./components/Home"
import NotFound from "./components/NotFoundPage/NotFound.tsx";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
            <Route path={"*"} element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>  
    </>
  )
}

export default App
