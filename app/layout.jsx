import './globals.css'
import LayoutNav from '@/components/layout/LayoutNav'
import LayoutFooter from '@/components/layout/LayoutFooter'

export const metadata = {
  title: 'Failbase — The Professional Network for Losers',
  description: 'Where the best professionals come to celebrate their worst moments. Post your failures. Earn your shame badge. Grow.',
  openGraph: {
    title: 'Failbase — The Professional Network for Losers',
    description: 'Post your failures. Earn your shame badge. Grow.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-fb-cream">
        <LayoutNav />
        <main className="pt-[60px]">
          {children}
        </main>
        <LayoutFooter />
      </body>
    </html>
  )
}
