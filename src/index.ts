import { createUnplugin } from 'unplugin';
import { resolveOptions } from './options';
import { PagesService } from './pages';
import { generateRoutes } from './routes';
import { generateClientCode } from './client';
import { MODULE_IDS, MODULE_ID_VIRTUAL } from './constants';
import { Route, UserOptions } from './types';

const reactPagesPlugin = createUnplugin<UserOptions>((userOptions = {}) => {
  let options = resolveOptions(userOptions);
  let generatedRoutes: Route[] | null = null;

  const pagesService = new PagesService(options, () => {
    generatedRoutes = [];
  });

  return {
    name: 'unplugin-react-pages',
    enforce: 'pre',
    resolveId(id) {
      return MODULE_IDS.includes(id) ? MODULE_ID_VIRTUAL : null;
    },
    async load(id) {
      if (id !== MODULE_ID_VIRTUAL) {
        return;
      }

      await pagesService.init();
      let pages = await pagesService.getPages();

      pages = (await options.onPagesGenerated(pages)) || pages;

      if (!generatedRoutes) {
        generatedRoutes = generateRoutes(pages);
        generatedRoutes =
          (await options.onRoutesGenerated(generatedRoutes)) || generatedRoutes;
      }

      let clientCode = generateClientCode(generatedRoutes, options);
      clientCode =
        (await options.onClientGenerated?.(clientCode)) || clientCode;

      return clientCode;
    },
    vite: {
      configResolved({ root: viteRoot, base: viteBase }) {
        options = resolveOptions(userOptions, viteRoot, viteBase);
        pagesService.setOptions(options);
      },
      configureServer(server) {
        pagesService.setServer(server);
      },
      buildStart() {
        pagesService.init();
      },
      async closeBundle() {
        await pagesService.close();
      },
    },
    // TODO: support webpack
    // webpack: (compiler) => {},
  };
});

export * from './types';

export default reactPagesPlugin;
