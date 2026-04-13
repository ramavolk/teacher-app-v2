"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((res) => res.json())
      .then((data) => {
        if (!data.admin) {
          router.push("/admin/login");
        } else {
          setAdmin(data.admin);
        }
        setLoading(false);
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>;
  }

  if (!admin) {
    return null;
  }

  return <AdminClient admin={admin} />;
}