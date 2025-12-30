// Vite plugin to import .md files as raw text (replaces raw-loader)
export default function rawLoader() {
  return {
    name: "vite-plugin-raw-loader",
    transform(code, id) {
      if (id.endsWith(".md")) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
    },
  };
}
