export default {
  port: 8185,
  staticDir: './static',
  pagesDir: './pages',
  outDir: './dist',
  generateStaticParams(path) {
    switch (path) {
      case '/user/[id]':
        return {
          id: ['zare_user'],
        };
    }
  },
};
