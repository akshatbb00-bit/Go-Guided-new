import { useUser } from "../../../../context/UserContext";
import AccessDenied from "../../../common/AccessDenied";
import Layout from "../AccountLayout";
import AdminLinks from "./AdminLinks";

function DashBoard() {
  const { user } = useUser();
  if (user?.role === "admin") {
    return (
      <Layout>
        <AdminLinks />
      </Layout>
    );
  }
  return <AccessDenied />;
}

export default DashBoard;
