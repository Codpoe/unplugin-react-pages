import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactPages from 'unplugin-react-pages/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), reactPages({ importMode: 'async' })],
});
