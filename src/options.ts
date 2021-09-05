import { resolve } from 'path';
import {
  ResolvedOptions,
  ResolvedPagesDir,
  UserOptions,
  UserPagesDir,
} from './types';
import { slash } from './utils';

function resolvePagesDir(
  pagesDir: UserPagesDir,
  root: string,
  base: string,
  defaultIgnored?: any
): ResolvedPagesDir {
  if (typeof pagesDir === 'string') {
    pagesDir = {
      [base]: pagesDir,
    };
  }

  return Object.entries(pagesDir).reduce((res, [baseRoutePath, config]) => {
    // ensure start slash
    if (!baseRoutePath.startsWith('/')) {
      baseRoutePath = '/' + baseRoutePath;
    }

    // remove trail slash
    if (baseRoutePath !== '/') {
      baseRoutePath = baseRoutePath.replace(/\/$/, '');
    }

    if (typeof config === 'string') {
      config = {
        dir: config,
      };
    }

    const ignored = config.ignored || defaultIgnored;

    res[baseRoutePath] = {
      dir: resolve(root, config.dir || 'src/pages'),
      glob: config.glob || '**/*{$.js,$.jsx,$.ts,$.tsx,$.md,$.mdx,.md,.mdx}',
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        ...(Array.isArray(ignored) ? ignored : [ignored]),
      ],
    };

    return res;
  }, {} as ResolvedPagesDir);
}

export function resolveOptions(
  userOptions: UserOptions,
  root = slash(process.cwd()),
  base = '/'
): ResolvedOptions {
  const {
    id = '',
    pagesDir = 'src/pages',
    ignored = [],
    importMode = 'async',
    extendPage = page => page,
    onPagesGenerated = pages => pages,
    onRoutesGenerated = routes => routes,
    onClientGenerated = code => code,
  } = userOptions;

  return {
    id,
    root,
    pagesDir: resolvePagesDir(pagesDir, root, base),
    ignored,
    importMode,
    extendPage,
    onPagesGenerated,
    onRoutesGenerated,
    onClientGenerated,
  };
}
