const { Course } = require("../models/course");
const { validate, validateArray } = require("../validation/validator");

exports.Courses = class {
    constructor({ db }) {
        this.db = db
        this._coursesCn = db.collection("courses");
    }
    
    getCourse = (query) => {
        return this._coursesCn.findOne(query);
    }
    
    getCourseById (id) {
        return this._coursesCn.findOne({_id:id});
    }

    getCourseByNumber = (number) => {
        return this._coursesCn.findOne({number:number});
    }
    
    getCourses = (query) => {
        return this._coursesCn.find(query).toArray();
    }

    updateCourse = async ({number, fieldName, fieldValue}) => {
        if(!fieldName) {
            return { error: "Invalid field."}
        }

        if(fieldName === "createdDate") {
            return { error: "Invalid field."}
        }

        var res = await this._coursesCn.updateOne({number}, {
            $set: {
                [fieldName]: [fieldValue]
            }
        }, {upsert: fieldName.startsWidth("details.")})
        return res;
    }

    deleteCourse = async ({number}) => {
        if(!number)
            return { error: "Invalid ID."}

        var res = await this._coursesCn.deleteOne({number});
        return res;
    }
    

    postCourse = async (course) => {
        let _c = new Course(course)
        const res = await this._coursesCn.findOne({number: _c.number, institution: _c.institution});
        
        if(res)
            return res;

        let validation = validate(_c);

        if(validation?.success) 
            return await this._coursesCn.insertOne(_c);
        else
            return validation;
    }

    postCourses = async ({courses, institution, createdBy}) => {
        const _courses = courses.map(c => new Course({...c, createdBy, institution}));

        var field

        let validation = validateArray(_courses);

        if(validation?.success) 
            return await this._coursesCn.insertMany(_courses);
        else
            return validation;
    }
}

