import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { User } from 'firebase/auth';

const AuthComponent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignUp = async () => {
        try {
            if (password !== confirmPassword) {
                setErrorMessage("Passwords don't match");
                return;
            }

            await auth.createUserWithEmailAndPassword(email, password);
            // User signed up successfully
            setErrorMessage('');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            // User signed in successfully
            setErrorMessage('');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            // User signed out successfully
            setErrorMessage('');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign In or Sign Up</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="email" // Add the autocomplete attribute

                />
            </div>
            <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="current-password" // Add the autocomplete attribute
                />
            </div>
            <div className="button-group">
                <button onClick={handleSignUp}>Sign Up</button>
                <button onClick={handleSignIn}>Sign In</button>
            </div>
            <div className="button-group">
                <button onClick={handleSignOut}>Sign Out</button>
            </div>
        </div>
    );
};

export default AuthComponent;
