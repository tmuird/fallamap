import { useState } from "react";

// Define an interface for the props
interface LoginFormProps {
    onLogin: (email: string, password: string) => void; // Assuming onLogin doesn't return anything
}

function LoginForm({ onLogin }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        onLogin(email, password);
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
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginForm;
