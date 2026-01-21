import "./globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;

  // Determine text direction based on locale
  const isRTL = ["ar"].includes(locale); // Add other RTL languages as needed
  const direction = isRTL ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction}>
      <head>
        <link rel="icon" href="/assets/svgs/logo.svg" type="image/svg+xml" />
      </head>
      <body className={direction}>
        {/* This is the main content of the page */}
        <main className={direction}>{children}</main>
      </body>
    </html>
  );
}
