import { useCallback, useEffect, useMemo, useState } from "react";
import { useBeforeUnload } from "react-router-dom";
import { useWindowEvent } from "./Events";

class TestStateManager {
    constructor(pool, courseId) {
        this.pool = pool
        this.courseId = courseId

    }

    get = (prev) => {
        var storage = this.getLocalStorage();

        return {
            courseId: this.courseId?.toString() ,
            questions: this.pool ? [...this.pool] : [] ,
            currentQuestion: (prev ? prev?.currentQuestion : storage?.currentQuestion) ?? null ,
            answeredIds: (prev ? prev?.answeredIds : storage?.answeredIds) ?? [] ,
            answeredWrongIds: (prev ? prev?.answeredWrongIds : storage?.answeredWrongIds) ?? [] ,
            answeredRightIds: (prev ? prev?.answeredRightIds : storage?.answeredRightIds) ?? [] ,
            scores: (prev ? prev?.scores : storage?.scores) ?? { 
                right: 0,
                wrong: 0
            },
        }
    }

    setCurrentQuestion = (arg) => {
        this.currentQuestion = arg;
    }

    save = (state) => {
        if(this.courseId){
            localStorage.setItem('testState'+this.courseId, JSON.stringify(state))
        }
    }

    getLocalStorage = () => {
        var result = localStorage.getItem('testState'+this.courseId)
        if (result) {
            try {
                return JSON.parse(result)
            }
            catch {
                return {};
            }
        }
        return {};
    }
}

export const useTestState = (questions, courseId) => {
    const stateManager = useMemo(() => new TestStateManager(questions, courseId), [questions, courseId])
    const [testState, setTestState] = useState(() => stateManager.get());

    useEffect(() => {
        setTestState(stateManager.get());
    }, [questions, courseId])

    const pushWrong = useCallback((id) => {
            setTestState((cr) => {
                if(!testState.answeredWrongIds.includes(id))
                    cr.answeredWrongIds.push(id)

                if(!cr.answeredIds.includes(id))
                    cr.answeredIds.push(id)
                cr.scores.wrong++;
                return cr;
            });
    }, [setTestState, testState]);

    const pushRight = useCallback((id) => {
        setTestState((cr) => {
                if (!testState.answeredRightIds.includes(id)) 
                    cr.answeredRightIds.push(id)

                if(!cr.answeredIds.includes(id))
                    cr.answeredIds.push(id)
                cr.scores.right++;
            })
    }, [setTestState])

    const getNextQuestion = useCallback((recState) => {
        let newState = recState ?? {...testState}
        let nextQuestion = null;
        if (newState.questions.length > 0) {
            let res = newState.questions.shift()
            if(newState.answeredIds.includes(res._id))
                nextQuestion = getNextQuestion(newState)[0]
            else
                nextQuestion = res;
        }
        else if (newState.answeredWrongIds.length > 0) {
            let res = newState.answeredWrongIds.shift()
            let q = questions.find(x => x._id === res);
            if(q){
                q.repeating = true;
                nextQuestion = q;
            }
            else 
                nextQuestion = getNextQuestion(newState)[0];
        }
        newState.currentQuestion = nextQuestion;
        return [nextQuestion, newState]
    }, [testState, questions])

    const nextQuestion = useCallback(() => {
        const [next, newState] = getNextQuestion();
        if(newState) {
            stateManager.save(newState)
            setTestState(newState);
        }
        return [next, newState];
    }, [setTestState, getNextQuestion])

    const skip = useCallback(() => {
        const old = testState.currentQuestion;
        const [next, newState] = getNextQuestion();
        newState.questions.push(old);

        if(newState) {
            setTestState(newState);
        }

        return [next, newState];
    }, [setTestState, getNextQuestion])

    const save = useCallback(() => stateManager.save(testState), [testState]);
    const reset = useCallback(() => {
        var newState = stateManager.get({});
        const [next, shawty] = getNextQuestion(newState);
        shawty
        stateManager.save(shawty)
        setTestState(shawty);
    }, [setTestState, questions]);


    useBeforeUnload(useCallback((e) => {
        e.preventDefault();
    }, [save]))
    // useWindowEvent('beforeunload', 
    // }, [testState]);
    

    return {save, nextQuestion, testState, pushRight, pushWrong, reset, skip}
}