// components/task/TaskStats.jsx
import React from "react";
import { MinusCircle, Loader2, CheckCircle } from "lucide-react";

const icons = {
  "Chưa thực hiện": <MinusCircle size={22} className="text-orange-500" />,
  "Đang thực hiện": <Loader2 size={22} className="text-blue-500 animate-spin" />,
  "Đã hoàn thành": <CheckCircle size={22} className="text-pink-500" />,
};

const colors = {
  "Chưa thực hiện": "bg-gradient-to-tr from-orange-100 to-orange-50",
  "Đang thực hiện": "bg-gradient-to-tr from-blue-100 to-blue-50",
  "Đã hoàn thành": "bg-gradient-to-tr from-pink-100 to-pink-50",
};

export default function TaskStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {stats.map((s) => {
        let statusText = s._id;
        if (s._id === "To Do") statusText = "Chưa thực hiện";
        else if (s._id === "In Progress") statusText = "Đang thực hiện";
        else if (s._id === "Done") statusText = "Đã hoàn thành";

        return (
          <div
            key={s._id}
            className={`p-3 rounded-xl shadow hover:shadow-lg transition-shadow relative overflow-hidden ${colors[statusText]}`}
          >
            {/* Decorative circle behind icon */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/20"></div>

            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-3 bg-white rounded-full shadow flex items-center justify-center">
                {icons[statusText]}
              </div>
              <p className="text-sm font-semibold text-gray-800 truncate">{statusText}</p>
            </div>

            <div className="text-gray-700 text-xs relative z-10">
              <p>
                <span className="font-medium">Số lượng:</span> {s.count}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
