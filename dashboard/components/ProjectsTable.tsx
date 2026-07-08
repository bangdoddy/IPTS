import React from "react";
import { Search, ChevronLeft, ChevronRight, Eye, Edit } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Project, ModuleId } from "../types";
import { formatDate } from "../utils";

export function ProjectsTable(props: {
  selectedModule: ModuleId | null;
  filteredProjects: Project[];
  selectedStatus: string;
  selectedStep: number | null;
  setSelectedStatus: (v: string) => void;
  setSelectedStep: (v: number | null) => void;
  getTypeColor: (type: string) => string;
  getStatusBadge: (project: Project) => React.ReactNode;
  onQccStepSubmitted?: () => void;
  ssPaging?: {
    pageNumber: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
    setPageNumber: (v: number) => void;
    setPageSize: (v: number) => void;
  };
  showDetailModal: (p: Project) => void;
  showEditModal: (p: Project) => void;
}) {
  const isSs = props.selectedModule === "ss";

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="px-4 py-3">Project Info</th>
              <th className="px-4 py-3">Department/Section</th>
              <th className="px-4 py-3">Team/Leader</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {props.filteredProjects.map((project, index) => (
              <tr 
                key={`${project.type}-${project.id || project.itemKey || project.ideNumber || index}`} 
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: `${props.getTypeColor(project.type)}15`, color: props.getTypeColor(project.type), borderColor: props.getTypeColor(project.type) }} variant="outline" className="text-[10px] font-bold">
                        {project.type}
                      </Badge>
                      <span className="font-semibold text-card-foreground line-clamp-1">
                        {project.namaGroupQccp || project.judulSS}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {project.itemKey || project.ideNumber}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{project.department}</span>
                    <span className="text-xs text-muted-foreground">{project.section}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{project.leader || project.pembuatSS}</span>
                    <span className="text-xs text-muted-foreground">
                      {project.leaderNrp || project.createdBy}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {props.getStatusBadge(project)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-primary"
                      onClick={() => props.showDetailModal(project)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isSs && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary"
                        onClick={() => props.showEditModal(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {props.filteredProjects.length === 0 && (
              <tr key="no-projects-found">
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground italic">
                  No projects found for current filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isSs && props.ssPaging && props.ssPaging.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            Showing page {props.ssPaging.pageNumber + 1} of {props.ssPaging.totalPages} ({props.ssPaging.totalRows} total rows)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={props.ssPaging.pageNumber === 0}
              onClick={() => props.ssPaging?.setPageNumber(props.ssPaging.pageNumber - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={props.ssPaging.pageNumber >= props.ssPaging.totalPages - 1}
              onClick={() => props.ssPaging?.setPageNumber(props.ssPaging.pageNumber + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
