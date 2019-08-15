import React from 'react';
import Page from '../layout/page.js';
import {Redirect} from 'react-router-dom'
import Modal from '../partials/modalWindow.js'
import config from '../../../config'

class LoginP extends React.Component {

    constructor (props) {

        super(props);
        this.state = {
            chatRedirect: false,
            errorRedirect:false,
            modalWindow:false,
            err:undefined,
            errMessage:undefined,
        };
    };
    showModal = () => {
        this.setState({err: {message:'This is test modal window. Dont worry be happy.'}});
        this.setState({modalWindow: true});
    };


    hideModal = () => {
        this.setState({modalWindow: false});
    };

    handleChange =(evt)=> {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    sendAuth = async (e) => {
        try {
            e.preventDefault();
            if(!this.state.username || !this.state.username) {
                this.setState({
                    err: {message:'You forgot type name, or password, try one more!'},
                    modalWindow:true,
                });
                return;
            }
            let data = {'username':this.state.username,'password':this.state.password};
            let res = await fetch('http://' + config.serverUrl +':'+ config.serverPort + '/login',{
                method:'post',
                body: JSON.stringify(data),
                headers:{'Content-Type': 'application/json',},
            });
            if(res.ok) {
                res = await res.json();
                console.log("login res.user: ",res.user);
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
        } catch (err){
            console.log("login err: ",err);
            this.setState({
                err: err,
                errMessage:"Sorry, but the server is temporarily unavailable, try again later.",
                modalWindow: true
            });
        }
    };

    render() {
        //console.log('/login user:',this.state);
        if(this.state.chatRedirect) {return <Redirect to='/chat'/>;}
        if(this.state.errorRedirect) {return <Redirect to='/error' />}
        return (
            <Page user={this.state.user} chatRedirect={this.state.chatRedirect} title="LOGIN PAGE" className="container">
                {this.state.modalWindow ?
                    <Modal show={this.state.modalWindow} handleClose={this.hideModal} err={this.state.err} message={this.state.errMessage}/>
                :''
                }
                <form onSubmit={this.sendAuth} className="page-login" name="loginform" id="form">
                    <div className="form-group">
                        <label htmlFor="input-username" className=" control-label">Name</label>
                        <input name="username"  type="text" className="form-input" id="input-username" placeholder="Name" onChange={this.handleChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="input-password" className="control-label">Password</label>
                        <input name="password"  type="password" className="form-input" id="input-password" placeholder="Password" onChange={this.handleChange}/>

                    </div>
                    <div className="form-group">
                        <div className="wrapper" >
                            <button type="submit" className="btn" data-loading-text="Sending...">SIGN IN</button>
                        </div>
                    </div>
                </form>
            </Page>
        )
    }
}

export default LoginP;