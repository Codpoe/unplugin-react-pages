import { createUnplugin } from 'unplugin';
import { resolveOptions } from './options';
import { PagesService } from './pages';
import { generateRoutes } from './routes';
import { generateClientCode } from './client';
import { REQUEST_IDS, MODULE_ID } from './constants';
import { Route, UserOptions } from './types';
import { appendPluginId } from './utils';

const reactPagesPlugin = createUnplugin<UserOptions>((userOptions = {}) => {
  let options = resolveOptions(userOptions);
  let generatedRoutes: Route[] | null = null;

  const finalModuleId = appendPluginId(MODULE_ID, options.id);

  const pagesService = new PagesService(options, finalModuleId, () => {
    generatedRoutes = null;
  });

  return {
    name: appendPluginId('unplugin-react-pages', options.id),
    enforce: 'pre',
    resolveId(id) {
      return REQUEST_IDS.some(x => id === appendPluginId(x, options.id))
        ? finalModuleId
        : null;
    },
    async load(id) {
      if (
        REQUEST_IDS.every(x => id !== appendPluginId(x, options.id)) &&
        id !== finalModuleId
      ) {
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
    // TODO: optimize for webpack
    // webpack: (compiler) => {},
  };
});

export * from './types';

export default reactPagesPlugin;
