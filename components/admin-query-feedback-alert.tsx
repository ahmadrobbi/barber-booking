"use client";

import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

type AdminQueryFeedbackAlertProps = {
  successMessage?: string | null;
  errorMessage?: string | null;
};

export function AdminQueryFeedbackAlert({
  successMessage,
  errorMessage,
}: AdminQueryFeedbackAlertProps) {
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
      if (typeof window !== "undefined") {
        const nextUrl = new URL(window.location.href);
        nextUrl.search = "";
        window.history.replaceState({}, "", nextUrl.toString());
      }
    });
  }, [errorMessage, successMessage]);

  return null;
}
