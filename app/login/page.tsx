"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import axios from "axios";
import api from "../../lib/axios";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [accountType, setAccountType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    const loginSchema = z.object({
      accountType: z
        .string()
        .min(1, "Please select an account type"),

      email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email"),

      password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    });

    const result = loginSchema.safeParse({
      accountType,
      email,
      password,
    });

    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        accountType,
        email,
        password,
      });

      const accessToken = response.data.access_token;
      const user = response.data.user;


      if (!accessToken || !user) {
        setErrorMessage("Invalid response from server");
        return;
      }

      document.cookie = `access_token=${encodeURIComponent(
        accessToken
      )}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `account_type=${encodeURIComponent(
        user.account_type
      )}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(
        JSON.stringify(user)
      )}; path=/; max-age=604800; SameSite=Lax`;

      switch (response.data.user.account_type) {
        case "admin":
          router.push("/admin");
          break;

        case "staff":
          router.push("/staff/dashboard");
          break;

        case "landlord":
          router.push("/landlord/Dashboard");
          break;

        case "tenant":
          router.push("/tenant/dashboard");
          break;

        default:
          setErrorMessage("Unknown account type");
          break;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage[0]);
        } else if (typeof backendMessage === "string") {
          setErrorMessage(backendMessage);
        } else if (!error.response) {
          setErrorMessage("Cannot connect to the backend");
        } else {
          setErrorMessage("Login failed");
        }
      } else {
        setErrorMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleLogin}>
        <h1 className={styles.title}>Login</h1>

        <p className={styles.subtitle}>
          Enter your account details
        </p>

        {errorMessage && (
          <p className={styles.error}>{errorMessage}</p>
        )}

        <div className={styles.formGroup}>
          <label
            className={styles.label}
            htmlFor="accountType"
          >
            Account Type
          </label>

          <select
            className={styles.input}
            id="accountType"
            value={accountType}
            onChange={(event) =>
              setAccountType(event.target.value)
            }
            disabled={loading}
          >
            <option value="">
              Select an account type
            </option>

            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="landlord">Landlord</option>
            <option value="tenant">Tenant</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label
            className={styles.label}
            htmlFor="email"
          >
            Email
          </label>

          <input
            className={styles.input}
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label
            className={styles.label}
            htmlFor="password"
          >
            Password
          </label>

          <div className={styles.passwordBox}>
            <input
              className={styles.passwordInput}
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              disabled={loading}
            />

            <button
              className={styles.showButton}
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          className={styles.loginButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}