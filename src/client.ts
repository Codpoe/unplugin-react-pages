import { ResolvedOptions, Route } from './types';

export function generateClientCode(routes: Route[], options: ResolvedOptions) {
  const { importMode } = options;
  const imports: string[] = [];
  let index = 0;

  const routesStr = JSON.stringify(routes, null, 2).replace(
    /"component":("(.*?)")/g,
    (str: string, replaceStr: string, component: string) => {
      if (importMode === 'sync') {
        const importName = `__route_${index++}__`;
        const importStr = `import ${importName} from '${component}';`;

        if (!imports.includes(importStr)) {
          imports.push(importStr);
        }

        return str.replace(replaceStr, importName);
      } else {
        return str.replace(replaceStr, `() => import('${component}')`);
      }
    }
  );

  return `${imports.join('\n')};

export const routes = ${routesStr};
export default routes;
`;
}
