import { ReactNode } from 'react';
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      {children}
    </div>
  );
};
export default AuthLayout;