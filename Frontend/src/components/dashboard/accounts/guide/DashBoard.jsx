import { useUser } from "../../../..//context/UserContext";
import AccessDenied from "../../../common/AccessDenied";
import Layout from "../AccountLayout";
import GuideLinks from "./GuideLinks";

function DashBoard() {
  const { user } = useUser();
  if (user?.role === "guide") {
    return (
      <Layout>
        <GuideLinks />
      </Layout>
    );
  }

  return <AccessDenied />;
}
export default DashBoard;
