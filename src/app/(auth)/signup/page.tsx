"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";

import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import { registerUser, SignUpFormValues } from "@/actions/auth/auth";

// Enhanced validation schema with Vietnamese messages
const signupSchema = z
  .object({
    fullName: z.string().min(1, "Họ tên là bắt buộc").min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z.string().min(1, "Email là bắt buộc").email("Định dạng email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu là bắt buộc").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    clearErrors();

    try {
      // Prepare data for registration
      const signUpData: SignUpFormValues = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      };

      // Register the user
      const result = await registerUser(signUpData);

      if (result.error) {
        setError("root", {
          type: "manual",
          message: result.error === "Email already in use" ? "Email này đã được sử dụng" : result.error,
        });
        setLoading(false);
        return;
      }

      // If registration is successful, sign in the user
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("root", {
          type: "manual",
          message: "Đăng ký thành công nhưng không thể đăng nhập tự động",
        });
        setLoading(false);
        return;
      }

      if (signInResult?.ok) {
        setSignupSuccess(true);
        // Redirect to home page on successful signup and login
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("root", {
        type: "manual",
        message: "Đã xảy ra lỗi không mong muốn",
      });
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Đăng ký để trải nghiệm dịch vụ tuyệt vời</p>
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Success message */}
          {signupSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 text-sm">Đăng ký thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Error message */}
          {errors.root && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm">{errors.root.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register("fullName")}
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  className={`pl-10 py-3 text-base ${
                    errors.fullName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  className={`pl-10 py-3 text-base ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu mới"
                  className={`pl-10 pr-12 py-3 text-base ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className={`pl-10 pr-12 py-3 text-base ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading || signupSuccess}
              className="w-full py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tạo tài khoản...
                </div>
              ) : signupSuccess ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Thành công!
                </div>
              ) : (
                "Tạo tài khoản"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Bằng việc đăng ký, bạn đồng ý với</p>
          <div className="flex justify-center gap-4 mt-1">
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              Điều khoản dịch vụ
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
