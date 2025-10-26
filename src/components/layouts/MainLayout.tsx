import { Outlet } from "react-router-dom";
import Navbar from "@/components/navigation/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
