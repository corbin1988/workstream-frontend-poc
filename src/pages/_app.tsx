import "@/styles/globals.css";
import type { AppProps } from "next/app";
import MainLayout from "@/components/MainLayout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Pages that should not have the main layout (sidebar + drawers)
  const noLayoutPages = ['/settings', '/login', '/signup'];
  const useLayout = !noLayoutPages.includes(router.pathname);

  // Check if Component has a custom layout preference
  const ComponentWithLayout = Component as any;
  const hasCustomLayout = ComponentWithLayout.useLayout !== undefined 
    ? ComponentWithLayout.useLayout 
    : useLayout;

  if (!hasCustomLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
