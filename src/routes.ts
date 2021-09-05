import { Page, Route } from './types';

interface ParentRoute extends Route {
  children: Route[];
}

export function generateRoutes(pages: Record<string, Page>): Route[] {
  const sortedPages = Object.values(pages).sort((a, b) =>
    a.routePath.localeCompare(b.routePath)
  );

  const allRoutes: Route[] = [];
  const parentRouteStack: ParentRoute[] = [];

  sortedPages.forEach(page => {
    const route: Route = {
      path: page.routePath,
      component: page.filePath,
      exact: page.isLayout ? false : true,
      children: page.isLayout ? [] : undefined,
    };

    while (parentRouteStack.length) {
      const parentRoute = parentRouteStack[parentRouteStack.length - 1];

      if (
        parentRoute.path === '/' ||
        route.path.startsWith(`${parentRoute.path}/`)
      ) {
        parentRoute.children.push(route);
        break;
      }

      parentRouteStack.pop();
    }

    if (!parentRouteStack.length) {
      allRoutes.push(route);
    }

    if (route.children) {
      parentRouteStack.push(route as ParentRoute);
    }
  });

  return allRoutes;
}
