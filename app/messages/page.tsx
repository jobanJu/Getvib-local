import { Suspense } from "react";
import { MessagesClientPage } from "@/features/messages/messages-client-page";

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesClientPage />
    </Suspense>
  );
}
