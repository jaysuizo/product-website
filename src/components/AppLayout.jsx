import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import MessengerFloatButton from "./MessengerFloatButton";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="mx-auto w-[min(1200px,94vw)] pb-16 pt-8">{children}</main>
      <Footer />
      <MessengerFloatButton />
    </div>
  );
}
