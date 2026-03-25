import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import MessengerFloatButton from "./MessengerFloatButton";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="mx-auto w-[min(1240px,96vw)] pb-20 pt-2 sm:w-[min(1240px,95vw)] sm:pb-16 sm:pt-6">{children}</main>
      <Footer />
      <MessengerFloatButton />
    </div>
  );
}
