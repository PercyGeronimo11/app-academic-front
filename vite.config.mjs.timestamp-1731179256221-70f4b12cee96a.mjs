// vite.config.mjs
import { defineConfig } from "file:///D:/_Tesis2/system-management-academic-front/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/_Tesis2/system-management-academic-front/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "node:path";
import autoprefixer from "file:///D:/_Tesis2/system-management-academic-front/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_dirname = "D:\\_Tesis2\\system-management-academic-front";
var vite_config_default = defineConfig(() => {
  return {
    plugins: [vue()],
    base: "/",
    css: {
      postcss: {
        plugins: [
          autoprefixer({})
          // add options if needed
        ]
      }
    },
    resolve: {
      alias: [
        // webpack path resolve to vitejs
        {
          find: /^~(.*)$/,
          replacement: "$1"
        },
        {
          find: "@/",
          replacement: `${path.resolve(__vite_injected_original_dirname, "src")}/`
        },
        {
          find: "@",
          replacement: path.resolve(__vite_injected_original_dirname, "/src")
        }
      ],
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue", ".scss"]
    },
    server: {
      port: 3e3,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
      historyApiFallback: true
      // Esta línea asegura que las rutas se manejen correctamente sin "#"
    },
    //Agregue para aumentar capacidad (por defecto es 500)
    build: {
      chunkSizeWarningLimit: 2e3
      // Ajusta el límite
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcX1Rlc2lzMlxcXFxzeXN0ZW0tbWFuYWdlbWVudC1hY2FkZW1pYy1mcm9udFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcX1Rlc2lzMlxcXFxzeXN0ZW0tbWFuYWdlbWVudC1hY2FkZW1pYy1mcm9udFxcXFx2aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L19UZXNpczIvc3lzdGVtLW1hbmFnZW1lbnQtYWNhZGVtaWMtZnJvbnQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3Z1ZSgpXSxcbiAgICBiYXNlOiAnLycsXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICBhdXRvcHJlZml4ZXIoe30pLCAvLyBhZGQgb3B0aW9ucyBpZiBuZWVkZWRcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW1xuICAgICAgICAvLyB3ZWJwYWNrIHBhdGggcmVzb2x2ZSB0byB2aXRlanNcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6IC9efiguKikkLyxcbiAgICAgICAgICByZXBsYWNlbWVudDogJyQxJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICdALycsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICdAJyxcbiAgICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy9zcmMnKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLnZ1ZScsICcuc2NzcyddLFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9zZXJ2ZXItb3B0aW9ucy5odG1sXG4gICAgICB9LFxuICAgICAgaGlzdG9yeUFwaUZhbGxiYWNrOiB0cnVlLCAvLyBFc3RhIGxcdTAwRURuZWEgYXNlZ3VyYSBxdWUgbGFzIHJ1dGFzIHNlIG1hbmVqZW4gY29ycmVjdGFtZW50ZSBzaW4gXCIjXCJcbiAgICB9LFxuXG4gICAgLy9BZ3JlZ3VlIHBhcmEgYXVtZW50YXIgY2FwYWNpZGFkIChwb3IgZGVmZWN0byBlcyA1MDApXG4gICAgYnVpbGQ6IHtcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCwgLy8gQWp1c3RhIGVsIGxcdTAwRURtaXRlXG4gICAgfSxcbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlQsU0FBUyxvQkFBb0I7QUFDeFYsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGtCQUFrQjtBQUh6QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsTUFBTTtBQUNoQyxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQUEsSUFDZixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUEsVUFDUCxhQUFhLENBQUMsQ0FBQztBQUFBO0FBQUEsUUFDakI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBO0FBQUEsUUFFTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYTtBQUFBLFFBQ2Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhLEdBQUcsS0FBSyxRQUFRLGtDQUFXLEtBQUssQ0FBQztBQUFBLFFBQ2hEO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sYUFBYSxLQUFLLFFBQVEsa0NBQVcsTUFBTTtBQUFBLFFBQzdDO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWSxDQUFDLFFBQVEsT0FBTyxPQUFPLFFBQVEsUUFBUSxTQUFTLFFBQVEsT0FBTztBQUFBLElBQzdFO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUE7QUFBQSxNQUVQO0FBQUEsTUFDQSxvQkFBb0I7QUFBQTtBQUFBLElBQ3RCO0FBQUE7QUFBQSxJQUdBLE9BQU87QUFBQSxNQUNMLHVCQUF1QjtBQUFBO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
