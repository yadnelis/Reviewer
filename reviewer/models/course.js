exports.Course = class {
    constructor(course) {
        this.name = course.name;
        this.institution = course.institution;
        this.number = course.number;
        this.createdBy = course.createdBy;
        this.details = course.details;
        this.createdDate = new Date().getTime();
    }
    
    getValidators () {
        return [
            { field: "number", run:() => !this.number, message:"Cannot be empty." },
            { field: "institution", run:() => !this.institution, message:"Cannot be empty." },
            { field: "createdBy", run:() => !this.institution, message:"Cannot be empty." },
            { field: "name", run:() => !this.name, message:"Cannot be empty." },
            { field: "details", run:() => typeof(this.details) != "object", message:"Must be object"},
        ]
    }
}