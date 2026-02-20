import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* HEADER PUBBLICO */}
      <Header />

      {/* CONTENUTO PAGINE PUBBLICHE */}
      {children}

      {/* FOOTER PUBBLICO */}
      <Footer />
    </>
  );
}
