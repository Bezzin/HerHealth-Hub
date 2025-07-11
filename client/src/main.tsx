import { createRoot } from "react-dom/client";
import "./index.css";

const useV2 = import.meta.env.VITE_UI_V2 === 'true';

async function loadApp() {
  const rootElement = document.getElementById("root")!;
  const root = createRoot(rootElement);

  console.log(`🎨 Dynamic UI Loading: ${useV2 ? 'v2 (Enhanced)' : 'v1 (Original)'}`);
  console.log('Environment VITE_UI_V2:', import.meta.env.VITE_UI_V2);

  if (useV2) {
    try {
      // Load UI v2 from client_v2
      console.log('Loading UI v2...');
      const { default: AppV2 } = await import('../../client_v2/src/App.tsx');
      root.render(<AppV2 />);
      console.log('✅ UI v2 loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load UI v2, falling back to v1:', error);
      const { default: App } = await import('./App.tsx');
      root.render(<App />);
    }
  } else {
    // Load UI v1 (original)
    console.log('Loading UI v1...');
    const { default: App } = await import('./App.tsx');
    root.render(<App />);
    console.log('✅ UI v1 loaded successfully');
  }
}

loadApp().catch(console.error);
