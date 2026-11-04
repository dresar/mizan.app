import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return [{ id: "detail" }];
}

export default function Page() {
  return <ClientPage />;
}
