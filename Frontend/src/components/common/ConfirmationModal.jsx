function ConfirmationModal({ text, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-10">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl max-w-md w-full">
        <p className="mb-6 text-green-800 font-semibold text-lg text-center">
          {text}
        </p>
        <div className="flex justify-center gap-6">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 cursor-pointer text-base min-w-[80px]"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer text-base min-w-[80px]"
            onClick={onCancel}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
