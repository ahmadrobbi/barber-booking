"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";

type AdminQueryFeedbackAlertProps = {
  successMessage?: string | null;
  errorMessage?: string | null;
};

export function AdminQueryFeedbackAlert({
  successMessage,
  errorMessage,
}: AdminQueryFeedbackAlertProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasShownRef = useRef(false);

  useEffect(() => {
    const message = successMessage || errorMessage;

    if (!message || hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;

    void Swal.fire({
      icon: successMessage ? "success" : "error",
      title: successMessage ? "Berhasil" : "Terjadi Kendala",
      text: message,
      confirmButtonText: "Oke",
      confirmButtonColor: successMessage ? "#111827" : "#dc2626",
    }).then(() => {
      router.replace(pathname);
    });
  }, [errorMessage, pathname, router, successMessage]);

  return null;
}
