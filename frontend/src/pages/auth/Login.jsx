import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  FingerPrintIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

import Page from "../../components/common/Page";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Checkbox from "../../components/ui/Checkbox";
import Button from "../../components/ui/Button";
import InputErrorMsg from "../../components/ui/InputErrorMsg";

import { useAuth } from "../../context/useAuth";
import { Config } from "../../utils/constants";
import { toast } from "sonner";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [formError, setFormError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = async (data) => {
    try {
      setFormError(null);
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";

      // ✅ Store only string
      setFormError(message);

      // ✅ Toast only once
      toast.error(message);
    }
  };

  return (
    <Page title="Login">
      <main className="min-h-screen grid place-items-center">
        <div className="w-full max-w-104 p-4 sm:px-5">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-semibold text-gray-700 ">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 ">
              {Config.app.name}
            </p>
          </div>

          {/* Card */}
          <Card className="mt-5 rounded-lg p-5 lg:p-7 border-gray-50">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-4">
                <Input
                  label="Username or Email"
                  placeholder="Enter username"
                  prefix={<EnvelopeIcon className="size-5" />}
                  {...register("identifier", {
                    required: "Username is required",
                  })}
                  error={errors.identifier?.message}
                />

                <Input
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  prefix={<LockClosedIcon className="size-5" />}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  error={errors.password?.message}
                />
              </div>

              {/* Inline error */}
              {formError && (
                <div className="mt-3">
                  <InputErrorMsg when>{formError}</InputErrorMsg>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Checkbox label="Remember me" />
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center space-x-3 text-xs">
              <div className="h-px flex-1 bg-gray-200" />
              <p>OR</p>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social (Disabled / Placeholder) */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outlined"
                className="h-10 flex-1 gap-3"
                disabled
              >
                <FingerPrintIcon className="size-5" />
                Touch ID
              </Button>

              <Button
                type="button"
                variant="outlined"
                className="h-10 flex-1 gap-3"
                disabled
              >
                <BoltIcon className="size-5" />
                Auth ID
              </Button>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 flex justify-center text-xs text-gray-400">
            <Link to="/privacy">Privacy Notice</Link>
            <span className="mx-2.5 w-px bg-gray-300" />
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </main>
    </Page>
  );
};

export default Login;
