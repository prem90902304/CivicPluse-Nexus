import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/api/client";
import { authService } from "@/api/services";
import { CivicAuthShell } from "@/components/auth/CivicAuthShell";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — CivicPulse Nexus" },
      {
        name: "description",
        content: "Sign in to the CivicPulse Nexus civic services portal.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values.email, values.password);

      toast.success("Signed in successfully");

      if (user.role === "ADMIN") {
        navigate({ to: "/admin/dashboard" });
      } else if (user.role === "OFFICER") {
        navigate({ to: "/officer/dashboard" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Sign in failed. Try again.";
      toast.error(message);
    }
  };

  const sendOtp = async () => {
    if (!z.string().email().safeParse(forgotEmail).success) {
      toast.error("Enter a valid registered email address.");
      return;
    }

    try {
      setResetLoading(true);
      await authService.forgotPassword(forgotEmail);
      setOtpSent(true);
      toast.success("OTP sent to your registered email.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send OTP.");
    } finally {
      setResetLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters.");
      return;
    }

    try {
      setResetLoading(true);
      await authService.resetPassword(forgotEmail, otp, newPassword);

      toast.success("Password reset successfully. Please sign in.");
      setForgotOpen(false);
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <CivicAuthShell
      title="Welcome back"
      subtitle="Sign in to manage complaints, service updates, and department work."
      footer={
        <>
          New citizen?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="email">Email address</Label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />

          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>

            <Link
              to="/login"
              className="text-xs font-medium text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setForgotOpen((open) => !open);
                setOtpSent(false);
              }}
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={!!errors.password}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox {...register("remember")} defaultChecked />
          Remember me
        </label>

        <Button
          type="submit"
          className="h-11 w-full bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}

          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {forgotOpen && (
        <div className="mt-5 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold">Reset password with OTP</p>
            <p className="text-xs text-slate-500">OTP expires after 10 minutes.</p>
          </div>

          <Input
            type="email"
            placeholder="Registered email address"
            value={forgotEmail}
            disabled={otpSent || resetLoading}
            onChange={(event) => setForgotEmail(event.target.value)}
          />

          {!otpSent ? (
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={sendOtp}
              disabled={resetLoading}
            >
              {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          ) : (
            <>
              <Input
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />

              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={resetPassword}
                disabled={resetLoading}
              >
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {resetLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          )}
        </div>
      )}

      <p className="mt-8 border-t border-slate-200 pt-5 text-center text-xs leading-5 text-slate-400">
        This is a secure civic-services platform. Unauthorised access is prohibited.
      </p>
    </CivicAuthShell>
  );
}
