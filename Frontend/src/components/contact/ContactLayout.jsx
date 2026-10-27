import ReachoutOptions from "./ReachoutOptions";
import ReachoutForm from "./ReachoutForm";

function ContactLayout() {
  return (
    <div className="px-6 md:px-32 py-6 grid grid-cols-1 md:grid-cols-[1.35fr_1.65fr] gap-6">
      <ReachoutOptions />
      <ReachoutForm />
    </div>
  );
}

export default ContactLayout;
