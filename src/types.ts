export type ImportMode = 'sync' | 'async' | 'preserve';

export type ImportModeResolveFn = (filePath: string) => ImportMode;

export interface Route {
  path: string;
  component: any;
  exact: boolean;
  children?: Route[];
}

export interface Page {
  basePath: string;
  routePath: string;
  filePath: string;
  meta: Record<string, any>;
  isLayout?: boolean;
}

export interface UserPagesDirObj {
  dir?: string;
  /**
   * Glob patterns for tracking.
   * @default '**\/*{$.js,$.jsx,$.ts,$.tsx,$.md,$.mdx,.md,.mdx}'
   */
  glob?: string | string[];
  /**
   * Defines files/paths to be ignored.
   */
  ignored?: any;
}

export type UserPagesDir = string | Record<string, string | UserPagesDirObj>;

export type ResolvedPagesDir = Record<string, Required<UserPagesDirObj>>;

export interface UserOptions {
  /**
   * Commonly used in multi-page application for differentiate plugin.
   * For example, if the id is set to 'admin',
   * the application needs to get the routes from 'virtual:generated-pages/admin'
   */
  id?: string;
  /**
   * Relative path to the directory to search for page components.
   * @default 'src/pages'
   */
  pagesDir?: UserPagesDir;
  /**
   * Defines files/paths to be ignored when resolving pages.
   * @default  ['**\/node_modules\/**', '**\/.git\/**']
   */
  ignored?: any;
  /**
   * Import page components directly or as async components
   * @default 'async'
   */
  importMode?: ImportMode | ImportModeResolveFn;
  /**
   * Extend page
   */
  extendPage?: (page: Page) => Page | void | Promise<Page | void>;
  /**
   * Custom generated pages
   */
  onPagesGenerated?: (
    pages: Record<string, Page>
  ) => Record<string, Page> | void | Promise<Record<string, Page> | void>;
  /**
   * Custom generated routes
   */
  onRoutesGenerated?: (
    routes: Route[]
  ) => Route[] | void | Promise<Route[] | void>;
  /**
   * Custom generated client code
   */
  onClientGenerated?: (
    clientCode: string
  ) => string | void | Promise<string | void>;
}

export interface ResolvedOptions extends Required<UserOptions> {
  root: string;
  pagesDir: ResolvedPagesDir;
}
