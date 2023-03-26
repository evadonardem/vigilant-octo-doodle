import React, { createContext, useEffect, useState } from 'react';
import cookie from 'react-cookies';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import Root from './Root';
import Login from './Login';

export const Auth = createContext(null);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [signedInUser, setSignedInUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const authorize = () => {
        const token = cookie.load('token');
        axios.post(`${apiBaseUrl}/me?token=${token}`, {})
            .then((response) => {
                const { data } = response;
                const { name: signedInUser } = data;
                setIsLoggedIn(true);
                setUser(data);
                setSignedInUser(signedInUser);
                axios.get(`${apiBaseUrl}/user/roles?token=${token}`)
                    .then((response) => {
                        const { data: roles } = response.data;
                        setUserRoles(roles);
                    });
                axios.get(`${apiBaseUrl}/user/permissions?token=${token}`)
                    .then((response) => {
                        const { data: permissions } = response.data;
                        setUserPermissions(permissions);
                    });
            })
            .catch(() => {
                setIsLoggedIn(false);
                setSignedInUser(null);
            });
    };

    const hasRole = (name) => !!_.find(userRoles, (role) => role.name === name);

    const handleSubmit = ({ biometricId, password } = e) => {
        axios.post(apiBaseUrl + '/login', { biometric_id: biometricId, password })
            .then((response) => {
                const { data } = response;
                const { token } = data;
                cookie.save('token', token);
                authorize();
            })
            .catch(() => {
                setIsLoggedIn(false);
                setSignedInUser(null);
                setErrorMessage('Invalid Biometric ID or password.');
            });
    };

    useEffect(() => authorize(), []);

    return (
        <>
            {isLoggedIn && user && (userRoles || userPermissions) &&
                <Auth.Provider value={{
                    user,
                    hasRole,
                }}>
                    <HashRouter>
                        <Root signedInUser={signedInUser}></Root>
                    </HashRouter>
                </Auth.Provider>}

            {!isLoggedIn &&
                <Login onSubmit={handleSubmit} errorMessage={errorMessage} />}
        </>
    );
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
