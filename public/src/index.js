import React from 'react'
import ReactDOM from 'react-dom';
import Login from './mainComp/login.js'
import Register from './mainComp/register.js'
import Error from './mainComp/error.js'
import Chat from './mainComp/chat.js'
import UserPage from './mainComp/userPage.js'
import UsersAdm from './mainComp/users.js'
import { MemoryRouter,BrowserRouter,Switch, Route, Redirect} from 'react-router-dom'
import '../css/app.css';
import FrontP from "./mainComp/frontpage";




//Check ? LogIn
function isLoggedIn() {
    //var user = JSON.parse(sessionStorage.getItem('user')).user;
    //console.log('/index checkOut user:',user);
    if (!JSON.parse(sessionStorage.getItem('user'))) {return false}
    else {return true}
}
//Check ? Admin
function isAdministrator() {
    if (!JSON.parse(sessionStorage.getItem('user'))) {return false}
    var user = JSON.parse(sessionStorage.getItem('user'));
    //console.log('/index Administrator: ',user);
    if (user.username === 'Administrator') {return true}
    else {return false}
}



const Main = () => (
    <MemoryRouter>
        <Switch>
            <Route exact path="/" render={() => <FrontP/>} />
            <Route path="/register" render={() => isLoggedIn() ?
                <Error error={{message:'You are always login in. Press SIGN OUT to create new account',status:'403 Forbidden'}} />
                :
                <Register/>}
            />
            <Route path="/login" render={() => isLoggedIn() ? (
                <Error error={{message:'You are always login in. Press SIGN OUT to change account',status:'403 Forbidden'}} />)
                :
                <Login/>}
            />
            <Route path="/chat"  render={() => isLoggedIn() ?
                <Chat />
                :
                <Redirect to="/login"/>}
            />
            <Route path="/userPage" render={() => isLoggedIn() ?
                <UserPage />
                :
                <Redirect to="/login"/>}
            />
            <Route path="/users" render={() => isAdministrator() ?
                <UsersAdm />
                :
                <Redirect to="/login"/>}
            />
            <Route path="/error" component={Error}/>
            <Route path="*" render={() => <FrontP/>} />
        </Switch>
    </MemoryRouter>
);

ReactDOM.render(<Main />,document.getElementById('root'));

if(module.hot) {module.hot.accept();}


