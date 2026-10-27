import { useUser } from "../../../../context/UserContext";
import Layout from "../AccountLayout";
import OwnerLinks from "./OwnerLinks";
import AccessDenied from "../../../common/AccessDenied";

function DashBoard() {
  const { user } = useUser();

  if (user?.role === "owner") {
    return (
      <Layout>
        <OwnerLinks />
      </Layout>
    );
  }
  return <AccessDenied />;
}

export default DashBoard;
