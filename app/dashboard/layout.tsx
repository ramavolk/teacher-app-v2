"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/login")
      .then(res => res.json())
      .then(data => {
        if (!data.teacher) {
          router.push("/login");
        } else {
          setIsAuthenticated(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>;
  }

  return <>{children}</>;
}