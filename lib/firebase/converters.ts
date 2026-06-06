import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

export function withId<T extends object>(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return { id: snapshot.id, ...snapshot.data() } as T;
}
