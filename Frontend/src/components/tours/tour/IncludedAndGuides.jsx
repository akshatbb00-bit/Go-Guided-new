import Avatar from "../../common/Avatar";

function IncludedAndGuides({ included, guides }) {
  return (
    <div className="flex flex-col justify-between gap-8 w-full md:w-[40%]">
      <div className="p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-3">
          What's Included
        </h3>
        <ul className="list-disc list-inside text-green-900 text-sm space-y-2">
          {included.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-green-800 mb-3">Tour Guides</h3>
        <div className="space-y-4">
          {guides.map((guide, index) => (
            <div key={index} className="flex items-center gap-4">
              {guide?.profilePicUrl ? (
                <Avatar size={48} imageURL={guide.profilePicUrl} />
              ) : (
                <Avatar
                  size={48}
                  bgColor="bg-green-500"
                  textColor="text-white"
                  textSize="text-xl"
                  fontWeight="font-semibold"
                  fullName={guide.name}
                />
              )}
              <span className="text-green-900 text-base font-medium">
                {guide.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IncludedAndGuides;
