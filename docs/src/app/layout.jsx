/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import FooterComponent from './components/footer'

export const metadata = {
  metadataBase: new URL('https://ismailbinmujeeb.github.io/zare/'),
  title: "Zare",
  description: 'A File-Based, Component-Based Template Engine',
  applicationName: 'Zare',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Zare'
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff'
  },
  primaryHue: 277,
  twitter: {
    site: 'https://ismailbinmujeeb.github.io/zare/'
  }
}

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>⚡Zare</b>
        </div>
      }
      // Next.js discord server
      chatLink="https://discord.gg/DyPFCMSkdy"
      projectLink="https://github.com/ismailbinmujeeb/zare"
    />
  )
  const pageMap = await getPageMap()
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          navbar={navbar}
          footer={<Footer style={{
            "padding": "60px 0 30px",
            "borderTop": "1px solid rgba(255, 255, 255, 0.1)",
          }}><FooterComponent /></Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/ismailbinmujeeb/zare/blob/main/docs"
          sidebar={{ autoCollapse: true }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
