// App.tsx - Main application component
import { Toaster } from 'sonner';
import { Dashboard } from './views/Dashboard';
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Dashboard />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
