import './App.css';
import AppRoutes from './route/routes';
import { AuthProvider } from './components/auth/auth-context';

function App() {
  return (
      <AuthProvider>
          <AppRoutes />
      </AuthProvider>
  );
}

export default App;