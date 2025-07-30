import nextra from 'nextra'

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false
  },
  contentDirBasePath: '/docs'
})

export default withNextra({
  output: "export",
  distDir: 'build',
  images: {
    unoptimized: true
  },
  reactStrictMode: true
})
