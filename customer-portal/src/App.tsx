import {useEffect} from 'react';
import {BrowserRouter,Navigate,Outlet,Route,Routes,useLocation} from 'react-router-dom';
import {useLocalAccount} from './services/account';
import ReferencePortal from './pages/ReferencePortal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ApplicationSubmittedPage from './pages/ApplicationSubmittedPage';
import DispatchFollowupPage from './pages/DispatchFollowupPage';
function RequireAccount(){
 const {authenticated}=useLocalAccount(),location=useLocation();
 return authenticated?<Outlet/>:<Navigate to="/login" replace state={{from:location.pathname+location.search}}/>;
}
function ScrollToTop(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0);},[pathname]);return null;}
export default function App(){
 return <BrowserRouter><ScrollToTop/><Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
  <Route path="/login" element={<LoginPage/>}/>
  <Route path="/register" element={<RegisterPage/>}/>
  <Route path="/application-submitted" element={<ApplicationSubmittedPage/>}/>
  <Route path="/follow-up" element={<DispatchFollowupPage/>}/>
  <Route element={<RequireAccount/>}><Route path="*" element={<ReferencePortal/>}/></Route>
 </Routes></BrowserRouter>;
}
