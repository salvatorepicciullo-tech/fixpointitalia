import Header from "../components/Header";
import Footer from "../components/Footer";

export const dynamic = "force-static";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
