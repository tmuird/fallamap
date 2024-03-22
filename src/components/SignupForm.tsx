import { useState } from 'react';

// Define a TypeScript interface for the component's props
interface SignupFormProps {
    onSignup: (email: string, password: string) => void; // Assuming onSignup doesn't return anything
}

function SignupForm({ onSignup }: SignupFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        onSignup(email, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button type="submit">Sign Up</button>
        </form>
    );
}

export default SignupForm;
