import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineLocalPhone } from "react-icons/md";
import { PiBuildingsBold } from "react-icons/pi";

function ReachoutOptions() {
  return (
    <div className="grid grid-rows-[1.35fr_0.65fr] grid-cols-1 bg-white space-y-2 pb-2 rounded-lg shadow-md shadow-black/50 max-w-xl mx-auto">
      <div className="w-full overflow-hidden rounded-lg">
        <img
          src="images/contact-us.webp"
          alt="contact us image"
          className="object-cover object-center w-full h-full rounded-lg"
        />
      </div>
      <div className="flex flex-col gap-2 bg-white rounded-lg p-4">
        <div className="grid grid-cols-[48px_1fr] gap-x-3 p-4 bg-green-50/25 rounded-lg">
          <MdOutlineLocalPhone
            size={48}
            color="green"
            className="bg-green-200 rounded-full p-2"
          />
          <div className="flex flex-col -space-y-1 break-words">
            <span className="text-xl font-medium">Phone</span>
            <span>+91-1234567890</span>
          </div>
        </div>
        <div className="grid grid-cols-[48px_1fr] gap-x-3 p-4 bg-green-50/25 rounded-lg">
          <HiOutlineMail
            size={48}
            color="green"
            className="bg-green-200 rounded-full p-2"
          />
          <div className="flex flex-col -space-y-1 break-words">
            <span className="text-xl font-medium">Email</span>
            <span> definitelynotspam@goguided.fake</span>
          </div>
        </div>
        <div className="grid grid-cols-[48px_1fr] gap-x-3 p-4 bg-green-50/25 rounded-lg">
          <PiBuildingsBold
            size={48}
            color="green"
            className="bg-green-200 rounded-full p-2"
          />
          <div className="flex flex-col -space-y-1 break-words">
            <span className="text-xl font-medium">Address</span>
            <span>404 Imaginary Street, Nowhere City, Planet Earth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReachoutOptions;
