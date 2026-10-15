import { useNavigate, useParams } from "react-router";
import { useCourse, useQuestions } from "../api/queries/queries"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useTestState } from "../inf/TestStateManager";
import { useEvent, UseQuestionModal, useWindowEvent } from "../inf/Events";
import { useAuth } from "../context/AuthContext";
import { put } from "../inf/httpClient";

const getIsRight = (question, input = "") => {
    if(question.type === "torf") {
        return input === question.answer.toString();
    }
    if(Array.isArray(question.answer)) {
        if(Array.isArray(input)) {
            return question.answer.reduce((prev, curr) => {
                return prev && input.includes(curr)
            }, true) 
        }
        else {
            return question.answer.includes(input);
        }
    }
    else {
        return input?.trimStart?.()?.trimEnd?.() === question?.answer?.toString();
    }
}

const sortRandom = (questions) => {
    return questions?.sort?.((a, b) => Math.random())
}

export const TestPage = () => {
    const navigate = useNavigate();
    const { courseNumber } = useParams();
    const { data:questions, isPending:isQuestionsPending, refetch }= useQuestions(courseNumber);
    const { data:course, isPending:isCoursePending } = useCourse(courseNumber);
    const [showAnswer, setShowAnswer] = useState(false);
    const [ triggerModal ] = UseQuestionModal();

    const { 
        save, 
        nextQuestion, 
        testState, 
        pushRight,  
        pushWrong, 
        reset, 
        skip
    } = useTestState(sortRandom(questions), course?._id);

    const { currentQuestion } = testState;
    const onNext = (correct) => {
        if(correct) 
            pushRight(currentQuestion._id)
        else
            pushWrong(currentQuestion._id)

        nextQuestion();
        setShowAnswer(false);
    } 
    const onShowAnswer = (correct) => {
       setShowAnswer(true);
    } 

    const onEdit = (question) => {
        triggerModal({
            question: question,
            onSubmit: ({_id, courseNumber, ...payload}) => {
                put(`/${courseNumber}/questions/${_id}`, payload)
                setTimeout(() => {
                    refetch?.();
                }, 2000)
            }
        })
    }

    if(isCoursePending || isQuestionsPending ){
        return (
            <div className="d-flex justify-content-center align-items-center">
                <div>loading...</div>
            </div>
        )
    }
    return (
        <div className="yr-test-page">
            <div className="test-meta mt-2 yr-text-semi-light rounded p-1 mx-2">
                <div className="">
                    {/* <span className="fs-16 fw-600">TEST </span> */}
                    <span className="text-wrap">{course?.number} {course?.name} </span>
                </div>
                <div className="">{course?.details?.profesor}</div>
            <div className="yr-bg-dark-gray rounded pt-1 w-100 mt-2"></div>
            </div>
            <div className="question-container">
                <div className="totals">
                    <span>{testState?.answeredIds?.length} / {questions?.length} </span>
                </div>
                <div className="question-card">
                    {
                        currentQuestion ? (
                            <Question 
                                key={currentQuestion?._id??'none'} 
                                nextQuestion={onNext} 
                                showAnswer={showAnswer}
                                onEdit={onEdit}
                                onShowAnswer={onShowAnswer}
                                {...(currentQuestion??{})}
                            />
                        ) : (
                            questions.length !== 0 ? 
                                testState.questions.length === 0 ? 
                                (
                                    <div className="d-flex flex-column gap-2 justify-content-center align-items-center h-100">
                                        <span>Wow ya acabaste..., dale reset</span>
                                        <button 
                                            className="yr-bg-main-4" 
                                            style={{minWidth:"70px"}}
                                            onClick={() => reset()}
                                            >Reset</button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-2 justify-content-center align-items-center h-100">
                                        <button 
                                            className="yr-bg-main-4" 
                                            style={{minWidth:"70px"}}
                                            onClick={() => reset()}
                                            >Start</button>
                                    </div>
                            ) :
                            <div className="d-flex flex-column gap-2 justify-content-center align-items-center h-100">
                                    <span>Looks like there are no questions</span>
                                    <button 
                                        className="yr-bg-main-4" 
                                        style={{minWidth:"70px"}}
                                        onClick={() => reset()}
                                    >Try again?</button>
                                </div>
                        )
                    }
                </div>
            </div>
            <div className="buttons my-5 mx-5 d-flex justify-content-center">
                <div className="w-fit yr-bg-dark-gray p-3 rounded justify-content-center">
                    <div className="d-flex gap-2">
                        <button 
                            className="yr-bg-main-3" 
                            style={{minWidth:"70px"}}
                            onClick={() => {
                                skip();
                                setShowAnswer(false);
                            }}
                            >skip</button>
                        <button 
                            className="yr-bg-main-4" 
                            style={{minWidth:"70px"}}
                            onClick={() => {
                                setShowAnswer(false);
                                reset();
                            }}
                            >reset</button>
                        {/* <button 
                            style={{minWidth:"70px"}}
                            className="yr-bg-main-5" 
                            onClick={() => {}}
                            >filter</button> */}
                        <button 
                            style={{minWidth:"70px"}}
                            className="yr-bg-main-5" 
                            onClick={() => navigate(`/app/course/${courseNumber}/review`)}
                            >review</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


const Question = (props) => {
    const { claims } = useAuth();
    const [input, setInput] = useState(null);
    const ref = useRef(null);

    const isRight = useMemo(() => getIsRight(props, input), [input])

    const QElem = useMemo(() => {
        if(props.type === "select") {
            return ChoiseQuestion
        }
        if(props.type === "selectMany") {
            return SelectManyQuestion
        }
        if(props.type === "torf") {
            return torfQuestion
        }
        else {
            return TextQuestion
        }
    })

    return (<div className="test-question position-relative">
        { props.showAnswer && (<div className="answer-banner">
            {
                isRight ?
                (<div className="right">Correct</div>)
                : (<div className="wrong">Incorrect</div>)
            }
            </div>)
        }
        <div className="d-flex justify-content-between">
            <div className="mb-2">
                <div className="mb-4">
                    {props?.tags?.map(tag => <Pill key={tag} className={"me-2"}>{tag}</Pill>)}
                </div>
                <span className="fs-16 fw-600">
                    {props?.prompt}
                </span>
                <div className="fs-12 yr-text-medium">
                    {props?.repeating && "You've got this question wrong before"}
                </div>
            </div>
            <div>
                {claims?.isAdmin && <button className="" onClick={() => props?.onEdit?.(props)}><i className="bi bi-pencil"></i></button>}
            </div>
        </div>
        <QElem {...props} isRight={isRight} ref={ref}/>
        <div className="d-flex justify-content-end">
            {props?.showAnswer ? 
                (<button className="yr-bg-main-3" onClick={() => props.nextQuestion(isRight)}>next</button>)
                :(<button className="yr-bg-main-3" onClick={() => {
                    props?.onShowAnswer(true);
                    setInput(ref.current?.value);
                }}>answer</button>)
            }
        </div>
    </div>
    )
}

const ChoiseQuestion = forwardRef(({choices, _id, isRight, showAnswer, answer}, ref) => {
    useImperativeHandle(ref, () => ({
        get value () {
            return document.querySelector(`input[name="${_id}"]:checked`)?.value
        }
    }))
    return (<div>
        <div>
            {
                choices && choices.map((x, i) => (
                    <Choise 
                        showAnswer={showAnswer} 
                        answer={answer}
                        isRight={isRight} 
                        key={x+_id} 
                        text={x} 
                        name={_id} 
                        index={i} 
                    />
                ))
            }
        </div>
    </div>)
})

const SelectManyQuestion = forwardRef(({choices, _id, isRight, showAnswer, answer, type}, ref) => {
    useImperativeHandle(ref, () => ({
        get value () {
            let values = []
            const dudes = document.querySelectorAll(`input[name="${_id}"]:checked`).values()
            for(let dude of  dudes){
                values.push(dude.value)
            }
            return values
        }
    }))
    return (<div>
        <div>
            {
                choices && choices.map((x, i) => (
                    <CheckChoid
                        type={type} 
                        showAnswer={showAnswer} 
                        answer={answer}
                        isRight={isRight} 
                        key={x+_id} 
                        text={x} 
                        name={_id} 
                        index={i} 
                    />
                ))
            }
        </div>
    </div>)
})

const CheckChoid = ({text, name, index, answer, showAnswer, type, isRight}) => {
    const ref = useRef(null);
    const showRight = showAnswer && getIsRight({answer, type}, text)
    const showWrong = showAnswer && !getIsRight({answer, type}, text) && ref.current?.checked

    return (<div className="position-relative w-fit">
        <input type="checkbox" name={name} id={name+index} value={text} ref={ref} className="me-3"/>
        <label type="checkbox" value={text} htmlFor={name+index}>{text}</label>
        { showRight && <RightMark className={"position-absolute"} style={{right: "-30px", top: '-7px'}}/>}
        { showWrong && <WrongMark className={"position-absolute"} style={{right: "-30px", top: '-7px'}}/>}
    </div>)
}


const torfQuestion = forwardRef((props, ref) => {
    const choices = ["true", "false"]
    return <ChoiseQuestion {...props} choices={choices} ref={ref}/>
})

const Choise = ({text, name, index, answer, showAnswer, isRight}) => {
    const ref = useRef(null);
    const showRight = showAnswer && (answer.toString() === text)
    const showWrong = showAnswer && !(answer.toString() === text) && ref.current?.checked

    return (<div className="radio-group position-relative w-fit">
        <input type="radio" name={name} id={name+index} value={text} ref={ref} className="me-3"/>
        <label type="radio" value={text} htmlFor={name+index}>{text}</label>
        { showRight && <RightMark className={"position-absolute"} style={{right: "-30px", top: '-7px'}}/>}
        { showWrong && <WrongMark className={"position-absolute"} style={{right: "-30px", top: '-7px'}}/>}
    </div>) 
};

const TextQuestion = forwardRef(({answer, showAnswer, isRight}, ref) => {
    return(<>
        <div className="d-flex column-gap-3 flex-wrap">
            <div className="w-fit position-relative ">
                <input type="text" className="w-100" ref={ref}/> 
                {showAnswer && (isRight ? 
                    <RightMark className={"position-absolute"} style={{right: "2px", top: '-7px'}}/>
                    : <WrongMark className={"position-absolute"} style={{right: "2px", top: '-7px'}}/>)
                }
            </div>
            {showAnswer && !isRight && <div className="wrong">Answer: {answer}</div>}
        </div>

    </>)
})

const Pill = ({children, className}) => {
    return(<span className={"rounded-pill yr-bg-main-3 text-semi-light fs-12 py-1 px-2 ".concat(className)}>{children}</span>)
}

const RightMark = ({className, ...rest}) => {
    return (
    <i 
        className={"bi bi-check-lg fs-24 right ".concat(className)}
        {...rest}
    />)
}

const WrongMark = ({className, ...rest}) => {
    return (
    <i 
        className={"bi bi-x fs-24 wrong ".concat(className)}
        {...rest}
    />)
}
