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

  if (!user) return <LoaderOverlay />;

  return <AccessDenied />;
}

export default DashBoard;
