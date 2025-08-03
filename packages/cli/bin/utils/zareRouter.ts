import { Express, Response, Request, Router } from 'express';
import { logger } from './logger';

export class ZareRouter {
  private router: Router = Router();
  private has404: Boolean = false;
  private pageNotFoundRoute: string = '';

  constructor(private routes: string[]) {}

  loadRoutes(app: Express) {
    this.routes.forEach(route => {
      if (route === '/404') {
        this.pageNotFoundRoute = route;
        return (this.has404 = true);
      }

      this.router.get(
        route == '/index' ? '/' : `${route.replace(/\[(\w+)\]/g, ':$1')}`,
        this.routeController(route),
      );
    });

    if (this.has404) {
      this.router.use(this.routeController(this.pageNotFoundRoute));
    }
  }

  getRoutes() {
    return this.router;
  }

  private routeController(templatePath: string) {
    return (req: Request, res: Response) => {
      const params = req.params;
      const query = req.query;
      res.render(`.${templatePath}`, { params, query });
    };
  }
}
