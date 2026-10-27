import { PiMoneyWavy } from "react-icons/pi";
import { FaGraduationCap } from "react-icons/fa6";
import { MdDiamond, MdOutlineSupportAgent } from "react-icons/md";
import FeatureCard from "../common/FeatureCard";

const benefits = [
  {
    icon: <PiMoneyWavy size={48} color="green" />,
    title: "Hassle-Free Reservations",
    description:
      "Hassle-free booking, easy cancellations, and quick refunds—ultimate flexibility for your convenience!",
  },
  {
    icon: <FaGraduationCap size={48} color="green" />,
    title: "Unforgettable Experiences",
    description:
      "We create lasting memories with unique, personalized, and immersive experiences just for you.",
  },
  {
    icon: <MdDiamond size={48} color="green" />,
    title: "Superior Quality & Reliability",
    description:
      "We deliver top-tier services with exceptional attention to detail, ensuring the highest standards every time.",
  },
  {
    icon: <MdOutlineSupportAgent size={48} color="green" />,
    title: "24/7 Customer Assistance",
    description:
      "We’re available around the clock to ensure your questions are answered promptly.",
  },
];

function WhyUs() {
  return (
    <div className="space-y-6 w-full px-4 ">
      <div className="text-center text-2xl sm:text-3xl font-bold text-green-800">
        Why Choose Us!
      </div>
      <div className="w-full rounded-xl">
        <div className="flex flex-wrap gap-4  items-center justify-center">
          {benefits.map((benefit, index) => (
            <FeatureCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WhyUs;
