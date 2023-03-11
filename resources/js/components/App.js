import React, { createContext, useState } from 'react';
import cookie from 'react-cookies';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import Root from './Root';
import Login from './Login';

export const Auth = createContext(null);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [signedInUser, setSignedInUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);

    function hasRole(name) {
        return !!_.find(userRoles, (role) => role.name === name);
    };

    function logIn(biometricId, password) {
        axios.post(apiBaseUrl + '/login', { biometric_id: biometricId, password })
            .then((response) => {
                const { data } = response;
                const { token } = data;
                cookie.save('token', token);
                setIsLoggedIn(true);

                axios.post(apiBaseUrl + '/me?token=' + token, {})
                    .then((response) => {
                        const { data } = response;
                        const { name: signedInUser } = data;
                        setSignedInUser(signedInUser);
                    })
                    .catch(() => {
                        setIsLoggedIn(false);
                        setSignedInUser(null);
                    });
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

    return (
        <>
            {isLoggedIn &&
                <Auth.Provider value={{
                    user: signedInUser,
                    hasRole,
                }}>
                    <HashRouter>
                        <Root signedInUser={signedInUser}></Root>
                    </HashRouter>
                </Auth.Provider>}

            {!isLoggedIn &&
                <Login logIn={logIn} />}
        </>
    );
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
