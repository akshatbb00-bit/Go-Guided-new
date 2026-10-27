import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function BookingChart({ bookingsPerMonth }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col justify-center items-center w-full">
      <h3 className="text-green-900 font-bold mb-4 text-center">
        Bookings Per Month
      </h3>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={bookingsPerMonth}>
            <XAxis dataKey="name" stroke="#065f46" tick={{ fill: "#065f46" }} />
            <YAxis stroke="#065f46" tick={{ fill: "#065f46" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#d1fae5",
                borderColor: "#065f46",
              }}
              itemStyle={{ color: "#065f46" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ fill: "#065f46", stroke: "#065f46", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BookingChart;
