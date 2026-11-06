import { Suspense } from "react";
import ClientPage from "./ClientPage";

export function generateStaticParams() {
  const prayers = ["subuh", "dhuha", "dzuhur", "ashar", "maghrib", "isya", "tahajjud"];
  const genders = ["putra", "putri", "l", "p"];
  const params: { id: string }[] = [{ id: "detail" }];

  prayers.forEach((p) => {
    genders.forEach((g) => {
      params.push({ id: `${p}-${g}` });
    });
  });

  params.push(
    { id: "2026-11-01-subuh-putra" },
    { id: "2026-11-01-subuh-putri" },
    { id: "2026-11-06-subuh-putra" },
    { id: "2026-11-06-subuh-putri" }
  );

  return params;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat detail sesi...</div>}>
      <ClientPage />
    </Suspense>
  );
}
