import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { ViteDevServer } from 'vite';
import { slash } from './utils';
import { Page, ResolvedOptions } from './types';

function resolveRoutePath(
  baseRoutePath: string,
  relativeFilePath: string,
  isLayout: boolean
) {
  const ext = path.extname(relativeFilePath);

  let routePath = slash(relativeFilePath)
    .replace(new RegExp(`\\$?${ext}$`), '') // remove ext and trail '$'
    .replace(/index$/, '') // remove 'index'
    .replace(/README$/i, '') // remove 'README'
    .replace(/\/$/, '') // remove trail slash
    .replace(/\[(.*?)\]/g, ':$1'); // transform 'user/[id]' to 'user/:id'

  routePath = path.posix.join(baseRoutePath, routePath);

  if (isLayout) {
    routePath = routePath === '/' ? '/*' : `${routePath}/*`;
  }

  return routePath;
}

function isLayoutFile(filePath: string) {
  return path.basename(filePath).startsWith('_layout');
}

export class PagesService {
  private initPromise: Promise<void[]> | null = null;
  private watchers: FSWatcher[] = [];
  private pages: Record<string, Page> = {};
  private server: ViteDevServer | null = null;

  constructor(
    private options: ResolvedOptions,
    private moduleId: string,
    private onReload: () => void
  ) {}

  init() {
    if (this.initPromise) {
      return;
    }

    return (this.initPromise = Promise.all<void>(
      Object.entries(this.options.pagesDir).map(
        ([baseRoutePath, { dir, glob, ignored }]) =>
          new Promise((resolve, reject) => {
            let isReady = false;

            glob = [
              '**/_layout{.js,.jsx,.ts,.tsx,.md,.mdx}',
              ...(Array.isArray(glob) ? glob : [glob]),
            ];

            const watcher = chokidar
              .watch(glob, {
                cwd: dir,
                ignored,
              })
              .on('add', async filePath => {
                await this.setPage(baseRoutePath, dir, filePath);

                if (isReady) {
                  this.reload();
                }
              })
              .on('unlink', filePath => {
                this.removePage(path.resolve(dir, filePath));
                this.reload();
              })
              .on('change', () => {
                // TODO: detect meta changed
              })
              .on('ready', () => {
                isReady = true;
                resolve();
              })
              .on('error', reject);

            this.watchers.push(watcher);
          })
      )
    ));
  }

  async close() {
    if (!this.initPromise) {
      throw new Error('PagesService is not initialized yet');
      return;
    }

    await Promise.all(this.watchers.map(w => w.close()));
    this.watchers = [];
    this.pages = {};
    this.initPromise = null;
  }

  async setOptions(options: ResolvedOptions) {
    this.options = options;
  }

  async setServer(server: ViteDevServer) {
    this.server = server;
  }

  reload() {
    this.onReload();

    if (!this.server) {
      return;
    }

    const module = this.server.moduleGraph.getModuleById(this.moduleId);

    if (module) {
      this.server.moduleGraph.invalidateModule(module);
    }

    this.server.ws.send({ type: 'full-reload' });
  }

  async getPages() {
    if (!this.initPromise) {
      throw new Error('PagesService is not initialized yet');
    }

    await this.initPromise;
    return this.pages;
  }

  async setPage(baseRoutePath: string, dir: string, filePath: string) {
    const isLayout = isLayoutFile(filePath);
    const routePath = resolveRoutePath(baseRoutePath, filePath, isLayout);
    const absFilePath = path.resolve(dir, filePath);

    let page: Page = {
      basePath: baseRoutePath,
      routePath,
      filePath: absFilePath,
      meta: {},
      isLayout,
    };

    page = (await this.options.extendPage(page)) || page;

    this.pages[absFilePath] = page;
  }

  removePage(key: string) {
    delete this.pages[key];
  }
}
