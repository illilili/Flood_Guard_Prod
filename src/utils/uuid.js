export function getOrCreateUUID() {
  const localStorageKey = "flood-prevention-uuid";
  let uuid = localStorage.getItem(localStorageKey);

  if (!uuid) {
    // UUID 생성
    uuid = crypto.randomUUID();
    localStorage.setItem(localStorageKey, uuid);
  }

  return uuid;
}
