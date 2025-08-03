import { LoginForm } from "@/components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-dvh flex-col items-center justify-center ">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
