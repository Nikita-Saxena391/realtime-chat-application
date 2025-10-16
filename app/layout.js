import "./globals.css";

export const metadata = {
  title: "AI Chat",
  description: "Realtime AI-powered chat"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
