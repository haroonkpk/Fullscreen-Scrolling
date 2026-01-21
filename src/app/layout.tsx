import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "en";
  const direction = "ltr";

  return (
    <html lang={locale} dir={direction}>
      <head>
        <link rel="icon" href="/assets/svgs/logo.svg" type="image/svg+xml" />
      </head>
      <body className={direction}>
        <main className={direction}>{children}</main>
      </body>
    </html>
  );
}
