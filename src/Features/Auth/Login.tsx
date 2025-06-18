import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { BarChart3, ShoppingBag, TrendingUp } from "lucide-react";
import { selectUser, userLogin } from "../../app/AuthSlice";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppDispatch } from "../../app/store";
import { useEffect } from "react";
import { toast } from "sonner";

// Define validation schema
const schema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(3, "Password is required"),
});

export default function LoginPage() {
  const { isAuthenticated, loading, error } = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    const response = await dispatch(userLogin(data));
    if (response.type === "user/login/fulfilled") {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
    if (localStorage.getItem("token")) {
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-6xl overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-center">
          <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-8">
            <div className="w-full max-w-sm space-y-6">
              <div className="flex justify-center items-center">
                <img
                  src="/actify-icon.png"
                  alt="Actify Inc."
                  className="h-10 w-10"
                />
                <span className="ml-2 text-xl font-semibold">
                  Actify Marketplace Admin
                </span>
              </div>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Login to your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials below to login to your account
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="admin@example.com"
                    {...register("username")}
                    className="w-full"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">
                      {typeof errors.username?.message === "string" &&
                        errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="w-full"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {typeof errors.password?.message === "string" &&
                        errors.password.message}
                    </p>
                  )}
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                {error && <p className="text-red-500 text-sm">{error.error}</p>}
              </form>
            </div>
          </div>
          
        </div>
      </Card>
    </div>
  );
}
