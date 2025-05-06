exports.Question = class {
    constructor(question) {
        this.prompt = question.prompt;
        this.courseNumber = question.courseNumber;
        this.answer = question.answer;
        this.type = question.type;
        this.choices = question.choices;
        this.image = question.image;
        this.tags = question.tags;
        this.createdBy = question.createdBy;
        this.details = question.details??{};
        this.createdDate = question.createdDate??new Date().getTime();
    }
    
    getValidators () {
        return [
            { field: "prompt", run:() => !this.prompt, message:"Cannot be empty." },
            { field: "answer", run:() => this.answer === null || this.answer === undefined, message:"Cannot be empty." },
            { field: "type", run:() => !this.type, message:"Cannot be empty." },
            { field: "type", run:() => !QuestionTypes.includes(this.type), message:"Invalid question type." },
            { field: "details", run:() => typeof(this.details) != "object", message:"Must be object"},
            { field: "tags", run:() => this.tags && !Array.isArray(this.tags), message:"Must be array"},
            { field: "answer", run:() => this.type === "selectMany" && !Array.isArray(this.answer), message:"Must be array for select many"},
            { field: "answer", run:() => this.type === "torf" && typeof(this.answer) != "boolean", message:"Must be boolan for true or false"},
        ]
    }
}

QuestionTypes = [
    "torf",
    "select",
    "selectMany",
    "text",
]

exports.QuestionTypes = QuestionTypes;