import React from 'react';
import Page from '../layout/page.js';
import {Redirect} from 'react-router-dom'
import CryptoJS from 'crypto-js'
import Modal from '../partials/modalWindow.js'
import Prompt from '../partials/promptModalWindow.js'
import Confirm from '../partials/confirmModalWindow.js'
import config from '../../../config'


class UserP extends React.Component {
    constructor (props) {
        let user = JSON.parse(sessionStorage.getItem('user'));
        super(props);
        this.state = {
            chatRedirect: false,
            errorRedirect:false,
            frontpageRedirect: false,
            buffCkName:undefined,
            user: user,
            newNameStatus:undefined,
            modalWindow:false,
            ConfirmModalWindow:false,
            PromptModalWindow:false,
            promptRes:undefined,
            confirmRes:undefined,
        };
    };
    //modal window handler
    hideModal = () => {
        this.setState({modalWindow: false});
    };
    //prompt window handler
    hidePrompt = () => {
        this.setState({PromptModalWindow: false});
    };
    //prompt window show
    showPrompt = (promptMessage) => {
        //console.log('promptMessage: ',promptMessage);
        this.setState({promptMessage: promptMessage,PromptModalWindow: true});
    };
    //prompt window handler
    promptHandler = (promptRes) => {
        //console.log('promptRes: ',promptRes);
        this.setState({promptRes: promptRes,PromptModalWindow: false});
        if(this.state.promptMessage === "Confirm You Password:") {
            this.setState({promptPass: promptRes,PromptModalWindow: false});
            this.setState({confirmMessage: "Are You ready to delete your account? " +
            "Pres Ok to delete or Cancel to regect",ConfirmModalWindow: true});
        }
    };
    //confirm window handler
    confirmHandler = (confirmRes) => {
        //console.log('confirmRes: ',confirmRes);
        this.setState({confirmRes: confirmRes,ConfirmModalWindow: false});
        if(this.state.promptMessage === "Confirm You Password:") {
            this.setState({confirmRes: confirmRes,ConfirmModalWindow: false},()=>this.deleteAccount());
        }
    };
    //delete user account
    deleteAccount = async ()=> {
        try {
            let name = this.state.user.username;
            let checkPass = this.state.promptPass;
            let result = this.state.confirmRes;
            console.log('checkPass: ',checkPass,',','result: ',result);
            if(!checkPass || !this.checkHash(this.state.user.hashedPassword,this.state.user.salt,checkPass)) {
                this.setState({err: {message:'Empty password or wrong password!'}, modalWindow:true,});
                return; //alert('Empty password or wrong password!');
            }
            if(!result) {
                this.setState({err: {message:'Ok Your account will not be deleted!'}, modalWindow:true,});
                return; //alert("Ok Your account will not be deleted!");
            }
            let data = {'deleteUsername':name,'checkPass':checkPass};
            let res = await fetch('http://' + config.serverUrl +':'+ config.serverPort + '/deleteAccount',{
                method:'post',
                body: JSON.stringify(data),
                headers:{'Content-Type': 'application/json',},
            });
            if(res.ok) {
                this.setState({err: {message:'User data deleted successful'}, modalWindow:true,});
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('error');
                setTimeout(()=>{this.setState({ frontpageRedirect: true });},2000)
            } else {
                sessionStorage.setItem('error', res);
                this.setState({ errorRedirect: true });
            }
        } catch (err){
            console.log("deleteAccount err: ",err);
            this.setState({
                err: err,
                errMessage:"Sorry, but the server is temporarily unavailable, try again later.",
                modalWindow: true
            });
        }
    };
    //Check for regular expressions
    regExpr =(name)=> {
        const a = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        return name.match(a);
    };
    //Check ReWriten newUsername
    ckReName =(e)=> {
        let newUsername = this.refs.nUInp;
        let newName = e.currentTarget.value;
        if(this.regExpr(newName)) {
            this.setState({err: {message:'Don not use special characters in name!'}, modalWindow:true,});
            return; //alert('Don not use special characters in name');
        }
        if(newName === this.state.buffCkName || newName === this.state.user.username || this.regExpr(newName)) {newUsername.style.color = '#69bc37';}
        else {newUsername.style.color = '#ca5b53';}
    };
    //Reade and validate input password
    ckPass =(e)=> {
        let keyLog = e.currentTarget.value;
        let pass = this.refs.oPInp;//Password inp field
        if(this.checkHash(this.state.user.hashedPassword,this.state.user.salt,keyLog)) {
            pass.style.color = '#69bc37';
        } else {
            pass.style.color = '#ca5b53';
        }
    };
    //Read and validate input confirm pass
    confPass =(e)=> {
        let keyLog = e.currentTarget.value;
        let newPassKeyLog = this.refs.nPInp;
        let confirmPassword = this.refs.cPInp;
        if(keyLog === newPassKeyLog.value) {
            confirmPassword .style.color = '#69bc37';
            newPassKeyLog.style.color = '#69bc37';
        } else {
            confirmPassword .style.color = '#ca5b53';
            newPassKeyLog.style.color = '#ca5b53';
        }
    };
    //checkHash
    checkHash =(userHash,userSalt,pass)=> {
        //HeshPass func
        let hash = CryptoJS.HmacSHA1(pass,userSalt).toString(CryptoJS.enc.Hex);
        return userHash === hash;
    };
    //Check name availability
    checkName = async (e)=> {
        try {
            e.preventDefault();
            let newUsername = this.refs.nUInp;
            let newName = newUsername.value;
            let oldUsername = this.state.user.username;
            if (this.regExpr(newName)) {
                this.setState({err: {message: 'Don not use special characters in name!'}, modalWindow: true,});
                return; //alert('Don not use special characters in name');
            }
            if (oldUsername === newName) {
                this.setState({err: {message: 'You Old name and new name is equal!'}, modalWindow: true,});
                return; //alert('You Old name and new name is equal.')
            }
            ;
            let data = {'newUsername': newUsername};
            let res = await fetch('http://' + config.serverUrl + ':' + config.serverPort + '/checkName', {
                method: 'post',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json',},
            });
            if (res.ok) {
                newUsername.style.color = '#69bc37';
                this.setState({buffCkName: newName});
                this.setState({newNameStatus: 'is free'});
            } else {
                newUsername.style.color = '#ca5b53';
                this.setState({newNameStatus: 'is in use'});
            }
        } catch (err) {
            console.log("checkName err: ", err);
            this.setState({
                err: err,
                errMessage:"Sorry, but the server is temporarily unavailable, try again later.",
                modalWindow: true
            });
        }
    };
    //Send new user data
    sendAuth = async (e) => {
        try {
            let username = (this.refs.nUInp).value;
            let password = (this.refs.nPInp).value;
            let confPass = (this.refs.cPInp).value;
            let oldUsername = this.state.user.username;
            let oldPassword = (this.refs.oPInp).value;
            if(this.regExpr(username)) {
                return this.setState({err: {message:'Don not use special characters in name!'}, modalWindow:true,});
            }
            if(!username) {
                return this.setState({err: {message:'You forgot type name, try one more!'}, modalWindow:true,});
            }
            if(!this.checkHash(this.state.user.hashedPassword,this.state.user.salt,oldPassword)) {
                return this.setState({err: {message:'You Old passwords is not valid!'}, modalWindow:true,});

            }
            if (!password || !confPass) {
                return this.setState({err: {message:'You forgot type passwords, try one more!'}, modalWindow:true,});

            }
            if (password != confPass) {
                return this.setState({err: {message:'Passwords not equal! Change passwords and try one more!'}, modalWindow:true,});

            }
            let data = {'oldUsername':oldUsername,'username':username,'password':password,'oldPassword':oldPassword};
            let res = await fetch('http://' + config.serverUrl +':'+ config.serverPort + '/changeUserData',{
                method:'post',
                body: JSON.stringify(data),
                headers:{'Content-Type': 'application/json',},
            });
            if(res.ok) {
                res = await res.json();
                console.log("UP sendAuth res.user: ",res.user);
                this.setState({err: {message:'User data changed successful!'}, modalWindow:true,});
                sessionStorage.setItem('user', res.user);
                setTimeout(()=>{this.setState({ chatRedirect: true });},2000);
            } else {
                sessionStorage.setItem('error', res);
                this.setState({ errorRedirect: true });
            }
        } catch (err){
            console.log("UP sendAuth err: ",err);
            this.setState({
                err: err,
                errMessage:"Sorry, but the server is temporarily unavailable, try again later.",
                modalWindow: true
            });
        }
    };

    render() {
        //console.log('/UP user: ',this.state.user);
        if(this.state.chatRedirect) {return <Redirect to='/chat'/>;}
        if(this.state.errorRedirect) {return <Redirect to='/error'/>}
        if(this.state.frontpageRedirect) {return <Redirect to='/'/>}
        return (
            <Page user={this.state.user} title="USER PAGE">

                {(this.state.modalWindow)?(
                    <Modal show={this.state.modalWindow} handleClose={this.hideModal} err={this.state.err}/>
                ):('')}

                {(this.state.PromptModalWindow)?(
                    <Prompt
                        promptHandler={this.promptHandler}
                        show={this.state.PromptModalWindow}
                        handleClose={this.hidePrompt}
                        name={"password"}
                        type={"password"}
                        placeholder={"password"}
                        message={this.state.promptMessage}/>
                ):('')}

                {(this.state.ConfirmModalWindow)?(
                    <Confirm confirmHandler={this.confirmHandler} show={this.state.ConfirmModalWindow} message={this.state.confirmMessage}/>
                ):('')}

                <form onSubmit={(ev)=>{
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.sendAuth();
                }} className="user-page" name="loginform" id="form">

                    <div className="form-group">
                        <label htmlFor="input-username" className="control-label">New Name {(this.state.newNameStatus)?(this.state.newNameStatus):('')}</label>
                        <input onChange={this.ckReName} id="newUsername" name="username"   type="text" className="form-control"  defaultValue={this.state.user.username}  ref="nUInp"/>
                        <div name="buttonform" className="btn-check">
                            <button onClick={this.checkName} className="btn" data-loading-text="Sending...">CHECK</button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="input-password" className="control-label">Old Password</label>
                        <input onChange={this.ckPass} id="oldPassword" name="oldPassword"  type="password" className="form-control" placeholder="Password" ref="oPInp"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="input-password" className="control-label">New Password</label>
                        <input id="newPassword" name="password"  type="password" className="form-control"  placeholder="Password" ref="nPInp"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="input-password" className="control-label">Confirm New Password</label>
                        <input onChange={this.confPass} id="confirmPassword" name="confirmPassword"  type="password" className="form-control"  placeholder="Password" ref="cPInp"/>
                    </div>

                    <div className="form-group">
                        <div className="wrapper" >
                            <button id= "changeData" type="submit" className="btn" data-loading-text="Sending...">CONFIRM</button>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="wrapper" >
                            <button onClick={(ev)=>{
                                ev.preventDefault();ev.stopPropagation();this.showPrompt("Confirm You Password:")}
                            } id= "deleteData" type="submit" className="btn" data-loading-text="Sending...">DELETE MY ACCOUNT</button>
                        </div>
                    </div>

                </form>


            </Page>
        )
    }
}


export default UserP;