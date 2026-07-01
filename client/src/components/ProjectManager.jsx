function ProjectManager({
  projectName, setProjectName, projects, saveProject, loadProjects, deleteProject, handleProjectClick
}) {
  return (
    <div className="projects-section">
      <h3>📁 Projects</h3>
      <input
        className="project-input"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
      />
      <button className="btn-save-project" onClick={saveProject}>Save Project</button>
      <button className="btn-load-projects" onClick={loadProjects}>Load Projects</button>

      {projects.map((project) => (
        <div key={project._id} className="project-card" onClick={() => handleProjectClick(project)}>
          <div className="project-card-inner">
            <div className="project-title">📁 {project.name}</div>
            <button
              className="btn-delete-project"
              onClick={(e) => {
                e.stopPropagation();
                deleteProject(project._id);
              }}
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectManager;