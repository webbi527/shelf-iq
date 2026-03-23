import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/onboarding");
  };

  const handleDemo = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-4">
            S
          </div>
          <h1 className="text-xl font-semibold">Sign in to ShelfIQ</h1>
          <p className="text-sm text-muted-foreground mt-1">Retail shelf intelligence for the Gulf</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 pr-9 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-9 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Sign in
          </button>
        </form>

        <button
          onClick={handleDemo}
          className="w-full mt-3 h-9 text-sm font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          Try demo account →
        </button>
      </div>
    </div>
  );
}
