import LoginForm from '@/components/admin/LoginForm';

export default function LoginPage() {
  return (
    <div className="admin-login-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--background)]">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--secondary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-md relative z-10">
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          &copy; {new Date().getFullYear()} KINT. All rights reserved.
        </div>
      </div>
    </div>
  );
}
