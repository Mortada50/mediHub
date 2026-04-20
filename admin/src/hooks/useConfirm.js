import { useState } from "react";

export function useConfirm() {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = ({ title, message, variant = "danger", onConfirm }) => {
    setConfirmState({ title, message, variant, onConfirm });
  };

  const close = () => setConfirmState(null);

  return { confirmState, confirm, close };
}
