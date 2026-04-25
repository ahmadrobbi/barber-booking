"use client";

import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

type AdminActionFeedbackAlertProps = {
  message?: string;
  success?: boolean;
};

export function AdminActionFeedbackAlert({
  message,
  success = false,
}: AdminActionFeedbackAlertProps) {
  const lastShownMessageRef = useRef("");

  useEffect(() => {
    if (!message || lastShownMessageRef.current === message) {
      return;
    }

    lastShownMessageRef.current = message;

    void Swal.fire({
      icon: success ? "success" : "error",
      title: success ? "Berhasil" : "Terjadi Kendala",
      text: message,
      confirmButtonText: "Oke",
      confirmButtonColor: success ? "#111827" : "#dc2626",
    });
  }, [message, success]);

  return null;
}
