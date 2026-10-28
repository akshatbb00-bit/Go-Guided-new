import { Navigate } from "react-router";
import { useUser } from "../../../../context/UserContext";
import Layout from "../AccountLayout";
import UserLinks from "./UserLinks";
import LoaderOverlay from "../../../common/LoaderOverlay";
import AccessDenied from "../../../common/AccessDenied";

function DashBoard() {
  const { isUserLoading, user } = useUser();

  if (user?.role === "user") {
    return (
      <Layout>
        <UserLinks />
      </Layout>
    );
  }

  if (isUserLoading) return <LoaderOverlay />;
  if (!user) return <Navigate to="/login" replace />;

  return <AccessDenied />;
}

export default DashBoard;
