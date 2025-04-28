exports.useQuestions = ({ db }) => {
    const questionsCn = db.collection("questions");
    const coursesCn = db.collection("courses");
    
    const getQuestion = (query) => {
        return questionsCn.findOne(query);
    }
    
    const getQuestionById = (course, id) => {
        return questionsCn.findOne({_id:id, course: course});
    }
    
    const getQuestions = (query) => {
        return questionsCn.find(query).toArray();
    }
    
    const getQuestionsByCourse = (course) => {
        return db.collection("questions").find({courseNumber:course}).toArray();
    }

    const postQuestion = async ({question, courseNumber}) => {
        const course = await coursesCn.find({number:courseNumber}).toArray();
        if(!course)
            coursesCn.insert({number: courseNumber, createdDate: new Date().getTime()})

        return questionsCn.insertOne({courseNumber: courseNumber, createdDate: new Date().getTime(), ...question})
    }

    return {
        postQuestion,
        getQuestion,
        getQuestionById,
        getQuestionsByCourse,
        getQuestions
    }
}
