import LoaderOverlay from "./components/common/LoaderOverlay";
import { useUser } from "./context/UserContext";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  const { isUserLoading } = useUser();

  if (isUserLoading) return <LoaderOverlay />;

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
