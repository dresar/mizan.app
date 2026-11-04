import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [{ id: "preview" }];
}

export default function Page() {
  return <ClientPage />;
}
