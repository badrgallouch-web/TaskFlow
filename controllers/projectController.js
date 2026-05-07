let projectList = [];

exports.getProjects = (req, res) => {
    console.log("Fetching projects...");
    res.status(200).json(projectList);
};

exports.addProject = (req, res) => {
    const { projectName, description, endDate } = req.body;

    if (!projectName || !description) {
        return res.status(400).json({ msg: "All fields are required!" });
    }

    const newProject = {
        id: Date.now(), 
        projectName,
        description,
        endDate,
        status: 'planned'
    };

    projectList.push(newProject);
    console.log("New project added to list!");
    res.status(201).json(newProject);
};

exports.removeProject = (req, res) => {
    const id = req.params.id;
    projectList = projectList.filter(item => item.id != id);
    console.log("Project deleted: " + id);
    res.json({ info: "Project deleted" });
};