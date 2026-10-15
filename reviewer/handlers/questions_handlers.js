
const {Question} = require('../models/question');
const { validate, validateArray } = require('../validation/validator');
var ObjectId = require('mongodb').ObjectId;

exports.useQuestions = ({ db }) => {
    const questionsCn = db.collection("questions");
    const coursesCn = db.collection("courses");
    
    const getQuestion = (query) => {
        return questionsCn.findOne(query);
    }
    
    const getQuestionById = (course, id) => {
        id = new ObjectId(id);
        return questionsCn.findOne({_id:id, course: course});
    }
    
    const getQuestions = (query) => {
        return questionsCn.find(query).toArray();
    }
    
    const getQuestionsByCourse = (course) => {
        return db.collection("questions").find({courseNumber:course}).toArray();
    }

    const postQuestion = async ({question, courseNumber, module}) => {
        const course = await db.collection("courses").findOne({number:courseNumber});

        if(!course)
            await coursesCn.insertOne({number: courseNumber, createdDate: new Date().getTime()})
        
        var res = await questionsCn.insertOne({courseNumber: courseNumber, ...question})
        return res;
    }

    const postQuestions = async ({questions, courseNumber, createdBy}) => {
        const course = await db.collection("courses").findOne({number:courseNumber});

        if(!course)
            await coursesCn.insert({number: courseNumber, createdDate: new Date().getTime()})

        
        const _questions = questions.map(x => new Question({
            ...x,
            createdBy,
            courseNumber,
        }));
        
        const validation = validateArray(_questions)

        if(!validation.success) {
            return { errors: validation.errors }
        }

        var res = await questionsCn.insertMany(_questions)
        return res;
    }

    const updateQuestionProperty = async ({_id, fieldName, fieldValue}) => {
        _id = new ObjectId(_id);
        if(!fieldName) {
            return { error: "Invalid field."}
        }

        if(!Object.keys(new Question()).includes(fieldName)) {
            return { error: "Invalid field."}
        }

        if(fieldName === "createdDate") {
            return { error: "Invalid field."}
        }

        var question = questionsCn.findOne({_id});
        if(!question)
            return { error: "Error does not exists"}
        
        var res = await questionsCn.updateOne({_id}, {
            $set: {
                [fieldName]: [fieldValue]
            }
        }, {upsert: true})
        return res;
    }

    const updateQuestion = async ({_id, question}) => {
        _id = new ObjectId(_id);
        const original = await questionsCn.findOne({_id});
        if(!original)
            return { error: "Does not exists"}

        var newQuestion = {
            ...original,
            ...question,
            createdDate: original.createdDate,
            createdBy: original.createdBy,
        }

        var res = await questionsCn.updateOne({_id}, {
            $set: newQuestion
        }, {upsert: true})
        return res;
    }

    const deleteQuestion = async ({_id}) => {
        _id = new ObjectId(_id);
        if(!_id)
            return { error: "Invalid ID."}

        var res = await questionsCn.deleteOne({_id});
        return res;
    }

    return {
        postQuestion,
        postQuestions,
        getQuestion,
        getQuestionById,
        getQuestionsByCourse,
        getQuestions,
        updateQuestionProperty,
        updateQuestion,
        deleteQuestion,
    }
}
