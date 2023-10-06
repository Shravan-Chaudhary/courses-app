import React, { FC, useState } from 'react';

interface SignUpData {
    email: string;
    password: string;
}

const SignUpComponent: FC = () => {
    const [signUpData, setSignUpData] = useState<SignUpData>({ email: '', password: '' });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSignUpData({ ...signUpData, [event.target.name]: event.target.value });
    };

    const handleSignUp = async () => {
        try {
            const response = await fetch('https://your-backend-url.com/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signUpData),
            });

            if (!response.ok) {
                throw new Error('Sign up failed');
            }

            const data = await response.json();
            console.log('Sign up successful', data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <input type="email" name="email" value={signUpData.email} onChange={handleInputChange} placeholder="Email" />
            <input type="password" name="password" value={signUpData.password} onChange={handleInputChange} placeholder="Password" />
            <button onClick={handleSignUp}>Sign Up</button>
        </div>
        );
};

export default SignUpComponent;
