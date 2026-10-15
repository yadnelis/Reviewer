import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import './styles/main.scss'
import "bootstrap-icons/font/bootstrap-icons.css";

import CourseListPage from './pages/CourseListPage'
import { Layout } from './pages/_layout';
import { TestPage } from './pages/TestPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { ReviewPage } from './pages/Review';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="*" element={<Navigate to="app" replace />} />  
      <Route path='app'>
        <Route element={<Layout/>}>
          <Route index element={<CourseListPage/>}/>
          <Route path='admin' element={<AdminPage/>}/>
          <Route path='about' element={<AboutPage/>}/>
          <Route path='course/:courseNumber'>
            <Route path='test?' index element={<TestPage/>}/>
            <Route path='review' element={<ReviewPage/>}/>
          </Route>
        </Route>
      </Route>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
