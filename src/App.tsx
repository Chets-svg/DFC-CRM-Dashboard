import './index.css' // This imports your Tailwind CSS
import CRMDashboard from './components/crm-dashboard'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CRMDashboard />
    </div>
  )

  return (
    <ThemeProvider>
      <CRMDashboard />
    </ThemeProvider>
  );
}

export default App