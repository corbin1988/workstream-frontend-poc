import { Html, Head, Main, NextScript } from "next/document";
import { ThemeModeScript } from "flowbite-react";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <ThemeModeScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // On page load or when changing themes, best to add inline in head to avoid FOUC
              if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
