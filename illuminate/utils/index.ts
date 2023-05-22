import path from "path";
import fs from "fs";
import {
  EndpointCallback
} from "types";

export function loadDir(dirPath: string) {
  const normalizedPath = path.normalize(dirPath);
  if (fs.existsSync(normalizedPath)) return;
  const {
    dir,
    base
  } = path.parse(normalizedPath);
  if (!fs.existsSync(dir)) {
    loadDir(dir);
  }
  fs.mkdirSync(normalizedPath);
}

export function generateEndpointsFromDirTree(rootPath: string, cb: EndpointCallback) {
  const stack = [rootPath];
  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (!currentPath) {
      break;
    }
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const status = fs.statSync(itemPath);

      if (status.isFile()) {
        const itemPathEndpoint = itemPath
        .replace(rootPath, "")
        .split(".")[0]
        .toLowerCase();
        cb(itemPathEndpoint, itemPath);
      } else if (status.isDirectory()) {
        stack.push(itemPath);
      }
    }
  }
}

export function getWildcard(str: string, query: string): string | null {
  if(query.split('*').length - 1 !== 1) return null;
  const withoutWildcard = query.split('*')[0];
  const startIndex = str.indexOf(withoutWildcard) + withoutWildcard.length;
  const endIndex = typeof query[withoutWildcard.length + 1] === "undefined"
    ? str.length
    : str.indexOf(query[withoutWildcard.length + 1], startIndex);
  return str.substring(startIndex, endIndex);
}
