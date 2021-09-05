export function slash(path: string) {
  return path.replace(/\\/g, '/');
}

export function appendPluginId(str: string, id: string) {
  return `${str}${id ? `/${id}` : ''}`;
}
