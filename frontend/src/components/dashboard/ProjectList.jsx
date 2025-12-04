// src/components/dashboard/ProjectList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects } from "../../services/projectService";

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await getMyProjects();
        setProjects(data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách dự án:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const displayedProjects = projects.slice(0, 9);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dự án của bạn</h2>

      {loading ? (
        <div className="text-gray-500 text-center py-6">
          Đang tải dự án...
        </div>
      ) : displayedProjects.length === 0 ? (
        <div className="text-gray-500 text-center py-6">
          Bạn chưa tham gia dự án nào.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/duan/${project._id}`)}
                className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-medium text-blue-600">
                  {project.project_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {project.description || "Không có mô tả"}
                </p>
              </div>
            ))}
          </div>

          {/* Nút Xem thêm */}
          {projects.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/duan")}
                className="text-blue-800 font-medium hover:underline"
              >
                Xem thêm →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
