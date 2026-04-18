import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Lock } from "lucide-react"; // Icons for input fields
import { useDispatch, useSelector } from "react-redux";
import { selectUser, userLogin } from "@/app/AuthSlice";
import { AppDispatch } from "@/app/store";
import { useNavigate } from "react-router-dom";

// 1. Define Validation Schema
const schema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(3, "Password is required"),
});

// Type inference from schema
type FormData = z.infer<typeof schema>;

const PennantLoginPage = () => {
  const { isAuthenticated, loading, error, user } = useSelector(selectUser);
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
      navigate(response.payload?.path, { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-blue-900 overflow-hidden">
      {/* Background Image with Blue Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop"
          alt="Background"
          className="h-full w-full object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-blue-600/40 mix-blend-multiply" />
      </div>

      {/* Login Card */}
      <div className="z-10 w-full max-w-[400px] bg-[#f2f2f2] shadow-2xl">

        {/* Header Section (White Background) */}
        <div className="bg-white py-8 text-center shadow-sm">
          {/* Placeholder Logo */}
          <div className="mx-auto flex h-16 w-fit items-center justify-center">
            <h1 className="text-2xl font-bold text-blue-600">Welcome to Pennant</h1>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Username/Email
              </label>
              <div className="relative">
                <input
                  {...register("username")}
                  type="text"
                  className="w-full border border-gray-300 bg-white p-2 pl-3 text-sm focus:border-blue-500 focus:outline-none"
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-blue-800" />
              </div>
              {typeof errors.username?.message === "string" &&
                errors.username.message}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type="password"
                  className="w-full border border-gray-300 bg-white p-2 pl-3 text-sm focus:border-blue-500 focus:outline-none"
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-blue-800" />
              </div>
              {typeof errors.password?.message === "string" &&
                errors.password.message}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full bg-[#0088cc] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0077b3]"
            >
             {loading ? "Logging in..." : "Login"}
            </button>

            {/* Footer Links */}
            <div className="mt-4 flex flex-col space-y-2 text-xs text-gray-600">
              <a href="#" className="underline hover:text-blue-600">
                Forgot/Reset Password?
              </a>
              <div className="flex gap-1">
                <span>Need to generate password? -</span>
                <a href="#" className="underline hover:text-blue-600">
                  Click here
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PennantLoginPage;