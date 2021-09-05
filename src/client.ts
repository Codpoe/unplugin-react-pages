import { ResolvedOptions, Route } from './types';

export function generateClientCode(routes: Route[], options: ResolvedOptions) {
  const { importMode } = options;
  const imports: string[] = [`import React from 'react';`];
  const lazyImports: string[] = [];
  let index = 0;

  const routesStr = JSON.stringify(routes, null, 2).replace(
    /"component":\s("(.*?)")/g,
    (str: string, replaceStr: string, component: string) => {
      const mode =
        typeof importMode === 'function' ? importMode(component) : importMode;

      if (mode === 'sync') {
        const name = `__route_${index++}`;
        const importStr = `import ${name} from '${component}';`;

        if (!imports.includes(importStr)) {
          imports.push(importStr);
        }

        return str.replace(replaceStr, name);
      }

      if (mode === 'async') {
        const name = `__route_${index++}`;
        const lazyImportStr = `const ${name} = React.lazy(() => import('${component}'));`;

        if (!lazyImports.includes(lazyImportStr)) {
          lazyImports.push(lazyImportStr);
        }

        return str.replace(replaceStr, name);
      }

      return str;
    }
  );

  return `${imports.join('\n')}

${lazyImports.join('\n')}

export const routes = ${routesStr};
export default routes;
`;
}
