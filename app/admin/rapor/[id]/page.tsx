import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [
    { id: "1A" },
    { id: "1B" },
    { id: "2A" },
    { id: "2B" },
    { id: "3A" },
    { id: "3B" },
    { id: "4A" },
    { id: "4B" },
    { id: "5A" },
    { id: "5B" },
    { id: "6A" },
    { id: "6B" },
    { id: "detail" }
  ];
}

export default function Page() {
  return <ClientPage />;
}
