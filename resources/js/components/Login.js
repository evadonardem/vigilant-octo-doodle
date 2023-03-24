import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';

export default function Login({ onSubmit, errorMessage } = props) {
    const [biometricId, setBiometricId] = useState(null);
    const [password, setPassword] = useState(null);

    const handleBiometricIdChange = (e) => {
        setBiometricId(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ biometricId, password });
    };

    return (
        <div className="row">
            <div className="col-md-4 offset-md-4 text-center">
                <form onSubmit={handleSubmit}>
                    <h1 className="h3 mb-3 font-weight-normal">
                        <i className="fa fa-5x fa-user"></i><br />
                        {appName}
                    </h1>
                    <p>Please sign in</p>
                    <div className="form-group">
                        <label htmlFor="inputBiometricId" className="sr-only">Biometric ID</label>
                        <input
                            type="text"
                            id="inputBiometricId"
                            className="form-control"
                            placeholder="Biometric ID"
                            autoFocus
                            onChange={handleBiometricIdChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="inputPassword"
                            className="form-control"
                            placeholder="Password"
                            autoComplete="false"
                            onChange={handlePasswordChange}
                        />
                    </div>
                    {errorMessage && <Alert variant="warning">{errorMessage}</Alert>}
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
                </form>
            </div>
        </div>
    );
}
