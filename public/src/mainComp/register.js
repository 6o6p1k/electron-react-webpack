import React from 'react';
import Page from '../layout/page.js';
import {Redirect} from 'react-router-dom'
import Modal from '../partials/modalWindow.js'
import config from '../../../config'



class RegisterP extends React.Component {

    constructor (props) {

        super(props);
        this.state = {
            chatRedirect: false,
            errorRedirect:false,
            modalWindow:false,
        };
    };

    hideModal = () => {
        this.setState({modalWindow: false});
    };

    handleChange =(e)=> {
        let name = this.refs.nInp;
        console.log("inpName: ",e.target.name,",","inpVal: ", e.target.value);
        if(e.target.name === "username") {
            console.log("regExpr: ",this.regExpr(e.target.value),",","regEnglish: ", this.regEnglish(e.target.value));
            if(!this.regExpr(e.target.value) && !this.regEnglish(e.target.value)) {
                name.style.color = '#69bc37';
            } else {
                name.style.color = '#ca5b53';
            }
        }
        this.setState({ [e.target.name]: e.target.value });
        let keyLog = e.currentTarget.value;
        let password = this.refs.pInp;
        let confirmPassword = this.refs.cPInp;
        if(keyLog === this.state.password || keyLog === this.state.confirmPassword) {
            confirmPassword.style.color = '#69bc37';
            password.style.color = '#69bc37';
        } else {
            confirmPassword.style.color = '#ca5b53';
            password.style.color = '#ca5b53';
        }
    };

    regExpr =(name)=> {
        const a = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?012345679]/;//special letters & numbers
        return name.match(a);
    };

    regEnglish =(name)=> {
        const a =/[^\x00-\x7F]/;//letters from a-z && A-Z
        return name.match(a);
    };


    sendAuth = async (e) => {
        try {
            e.preventDefault();
            let username = this.state.username;
            let password = this.state.password;
            let confPass = this.state.confirmPassword;
            if(!username) {
                return this.setState({
                    err: {message:'You forgot type name, or password, try one more!'}, modalWindow:true,
                });
            }
            if(this.regExpr(username)) {
                return this.setState({
                    err: {message:'Don not use special characters in name!'}, modalWindow:true,
                });
            }
            if (!password || !confPass) {
                return this.setState({
                    err: {message:'You forgot type passwords!'}, modalWindow:true,
                });
            }
            if (password !== confPass) {
                return this.setState({
                    err: {message:'Passwords not equal! Change passwords and try one more.'}, modalWindow:true,
                });
            }
            let data = {'username':this.state.username,'password':this.state.password};
            let res = await fetch('http://' + config.serverUrl +':'+ config.serverPort + '/register',{
                method:'post',
                body: JSON.stringify(data),
                headers:{'Content-Type': 'application/json',},
            });
            if(res.ok) {
                res = await res.json();
                console.log("reg sendAuth res.user: ",res.user);
                sessionStorage.setItem('user', JSON.stringify(res.user));
                this.setState({ chatRedirect: true });
            } else {
                if(res.status === 403) {
                    this.setState({err: res});
                    this.setState({modalWindow: true});
                } else {
                    sessionStorage.setItem('error', JSON.stringify(res));
                    this.setState({ errorRedirect: true });
                }
            }
        } catch (err) {
            console.log("reg sendAuth login err: ",err);
            this.setState({
                err: err,
                errMessage:"Sorry, but the server is temporarily unavailable, try again later.",
                modalWindow: true
            });
        }
    };

    render() {

        //console.log('/login user:',this.state.user);
        if(this.state.chatRedirect) {return <Redirect to='/chat'/>;}
        if(this.state.errorRedirect) {return <Redirect to='/error' />}
        return (
            <Page user={this.state.user} title="REGISTRATION PAGE" className="container">
                {(this.state.modalWindow)?(
                    <Modal show={this.state.modalWindow} handleClose={this.hideModal} err={this.state.err}/>
                ):('')}
                <form onSubmit={this.sendAuth} className="login-form page-login" name="loginform" id="form">
                    <div className="form-group">
                        <label htmlFor="input-username" className=" control-label">Name</label>
                        <input name="username"  type="text" className="form-control" id="input-username" placeholder="Name" ref="nInp" onChange={this.handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="input-password" className="control-label">Password</label>
                        <input name="password"  type="password" className="form-control" id="input-password" placeholder="Password" ref="pInp" onChange={this.handleChange}/>
                    </div>
                       <div className="form-group">
                           <label htmlFor="input-password" className="control-label">Confirm Your Password</label>
                           <input name="confirmPassword"  type="password" className="form-control" id="confirm-password" placeholder="Password" ref="cPInp" onChange={this.handleChange}/>
                       </div>
                    <div className="form-group">
                        <div className="wrapper" >
                            <button type="submit" className="btn" data-loading-text="Sending...">CREATE ACCOUNT</button>
                        </div>
                    </div>
                </form>
            </Page>
        )
    }
}

export default RegisterP;