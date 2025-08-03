import { RegisterForm } from "@/components/Auth/RegisterForm";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-dvh flex-col items-center justify-center ">
      <div className="w-full max-w-sm md:max-w-3xl">
        <RegisterForm />
      </div>
    </div>
  );
}
