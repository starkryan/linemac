import { redirect } from 'next/navigation';
import AadhaarHeaderUI from '@/app/components/AadhaarHeaderUI';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For now, we'll just render the header and children
  // In a real app, you'd check authentication here
  return (
    <div className="min-h-screen bg-gray-100">
      <AadhaarHeaderUI />
      {children}
    </div>
  );
}