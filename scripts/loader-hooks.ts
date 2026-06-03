import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier: string, context: { parentURL: string }, nextResolve: Function) {
  if (specifier.startsWith('.') && !specifier.match(/\.\w+$/)) {
    const parentPath = fileURLToPath(context.parentURL);
    const dir = path.dirname(parentPath);
    const base = path.resolve(dir, specifier);

    if (existsSync(base + '.ts')) {
      return nextResolve(specifier + '.ts', context);
    }
    if (existsSync(path.join(base, 'index.ts'))) {
      return nextResolve(specifier + '/index.ts', context);
    }
  }
  return nextResolve(specifier, context);
}
