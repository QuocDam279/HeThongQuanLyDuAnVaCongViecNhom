import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjectById } from "../../services/projectService";
import { ChevronRight, Users, FolderKanban } from "lucide-react";

export default function NameTeamProject({ task }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!task) return;

    async function loadData() {
      try {
        const proj = await getProjectById(task.project_id);
        setProject(proj);
      } catch (err) {
        console.error("Lỗi lấy project:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [task]);

  return (
    <div className="py-2">
      {loading ? (
        <p className="text-gray-500 text-sm italic">Đang tải...</p>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-700">

          {/* Link tới nhóm */}
          <Link
            to={`/nhom/${project?.team?._id}`}
            className="group hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <Users size={14} className="text-gray-500" />
            {project?.team?.team_name || "Không xác định"}
          </Link>

          <ChevronRight size={16} className="text-gray-400" />

          {/* Link tới dự án */}
          <Link
            to={`/duan/${project?._id}`}
            className="group hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <FolderKanban size={14} className="text-gray-500" />
            {project?.project_name || "Không xác định"}
          </Link>
        </div>
      )}
    </div>
  );
}
