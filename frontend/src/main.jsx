
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { CanvasContextProvider } from './Context/canvasContext.jsx';
import { VideourlContextProvider } from './Context/videourlContext.jsx';
import { OverlayedvideourlContextProvider } from './Context/overlayedvideourlContext.jsx';
import { ImageurlContextProvider } from './Context/imageurlContext.jsx';
import { SocketContextProvider } from './Context/socketContext.jsx';
import { SocketidContextProvider } from './Context/socketidContext.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <CanvasContextProvider>
        <VideourlContextProvider>
          <OverlayedvideourlContextProvider>
            <ImageurlContextProvider>
              <SocketContextProvider>
                <SocketidContextProvider>
                  <App />
                </SocketidContextProvider>
              </SocketContextProvider>
            </ImageurlContextProvider>
          </OverlayedvideourlContextProvider>
        </VideourlContextProvider>
      </CanvasContextProvider>
    </BrowserRouter>
)
