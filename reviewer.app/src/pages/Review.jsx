import { useParams } from "react-router"
import { useQuestions } from "../api/queries/queries"
import { useAuth } from "../context/AuthContext"
import { post, put, remove } from "../inf/httpClient"
import { useEffect, useRef, useState } from "react"
import { Portal } from "../lib/Portal"
import ReactDOM from 'react-dom'
import { ModalEvents, trigger, useEvent, UseQuestionModal, UseQuestionUpdated } from "../inf/Events"

export const ReviewPage = () => {
    const { claims, username } = useAuth()
    const { courseNumber } = useParams()
    const { data: questions, refetch } = useQuestions(courseNumber)
    const [trigger] = UseQuestionModal();

    const refresh = () => {
        setTimeout(() => {
            refetch?.()
        }, 2000)
    }

    const postQuestion = (payload) => {
        post(`/${courseNumber}/questions`, [payload])
        refresh()
    }

    const onCreateQuestion = () => {
        trigger({
            onSubmit: postQuestion
        })
    }

    return (
        <div className="review-page">
            {
                claims?.isAdmin && ((
                        <div className="d-flex justify-content-center m-2 position-sticky top-0 pt-2">
                            <button className="btn-primary" onClick={() => {
                                onCreateQuestion();
                            }}>New Question</button>
                        </div>
                    )
                )
            }
        <div className="questions">
                {
                    questions?.map(x => <Question key={x._id} {...x} 
                        onDelete={async (_id, courseNumber) => {
                            remove(`${courseNumber}/questions/${_id}`)
                            refresh();
                        }}
                        onEdit={async ({_id, courseNumber, ...payload}) => {
                            put(`/${courseNumber}/questions/${_id}`, payload)
                            refresh();
                        }}
                    />)
                }
            </div>
        </div>
    );   
}


export const QuestionModal = ({}) => {
    const { courseNumber } = useParams();
    const [ question, setQuestion ] = useState({});
    const modalref = useRef(null);
    const _onSubmit = useRef(() => {});
    const _onCancel = useRef(() => {});
    
    const tiggerModal = ({detail}) => {
        modalref.current?.show()
        _onSubmit.current = detail?.onSubmit
        _onCancel.current = detail?.onCancel
        if(detail?.question) {
            setQuestion(detail.question);
        }
    }
    useEvent(ModalEvents.QuestionModal.event, tiggerModal)

 
    return  ReactDOM.createPortal(
        <Portal ref={modalref} onClose={_onCancel.current}>
            <div className="new-question-container">
                <span className="header">New Question</span>
                <EditQuestion
                    courseNumber={courseNumber}
                    {...question}
                    onEdit={(id, courseNumber, payload) => {
                        _onSubmit?.current?.(id, courseNumber, payload)
                        setQuestion({})
                        modalref.current?.hide()
                    }}
                />
            </div>
        </Portal>
    , document.body)
}

const Question = (props) => {
    const {prompt, answer, type, choices, courseNumber, _id, tags, toLowerCase, removeFormatting, onEdit, onDelete} = props;
    const { claims, username } = useAuth()
    const [editing, setEditing] = useState(false);

    const _onEdit = (id, c, p) => {
        setEditing(false)
        onEdit?.(id, c, p)
    }
    
    return editing ? 
        (<EditQuestion {...props} onCancel={() => setEditing(false)} onEdit={_onEdit} showX/>)
        : (

            <div className="review-detail">
                <div>
                    <div className="fw-600 fs-16">{prompt}</div>
                    <div className="fw-600"><span className="yr-text-main-3">answer:</span> {Array.isArray(answer) ? answer.join(", "): answer.toString()}</div>
                    <div className="ms-3 mt-2">
                        <div>type: {type}</div>
                        {toLowerCase && <div className="yr-text-medium">apply: to lower case</div>}
                        {removeFormatting && <div className="yr-text-medium">apply: remove formatting</div>}
                        {choices && (<div>choices: 
                                <div className="ms-3">{choices.map((x, i) => <div className="choice-option" key={x+i}>{x}</div>)}</div>
                            </div>)
                        }
                    </div>
                </div>

                                
                {claims?.isAdmin && (<div className="button-row">
                        <button onClick={() => setEditing(true)} className="bi bi-pencil btn-secondary"/>
                        <button onClick={() => onDelete(_id, courseNumber)} className="bi bi-trash btn-danger"/>
                    </div>)
                }
            </div>

        );
}

export const EditQuestion = ({_id, prompt, answer, type, choices, courseNumber, tags, toLowerCase, removeFormatting, onCancel, onEdit, showX}) => {
    const promptRef = useRef(null);
    const answerRef = useRef(null);
    const typeRef = useRef(null);
    const tagsRef = useRef(null);
    const choicesRef = useRef(null);
    const toLowerCaseRef = useRef(null);
    const removeFormattingRef = useRef(null);


    const onChange = () => {};
    const _onSubmit = () => {
        let payload = {
            courseNumber: courseNumber,
            prompt: promptRef.current?.value,
            answer: answerRef.current?.value.split(',').map(x => x.trim()),
            tags: tagsRef.current?.value.split(',').map(x => x.trim()),
            type: typeRef.current?.value,
            toLowerCase: toLowerCaseRef.current?.checked,
            removeFormatting: removeFormattingRef.current?.checked,
            choices: choicesRef.current?.value.split(',').map(x => x.replaceAll('\n', '').trim()),
        }

        payload = Object.entries(payload).reduce((prev, curr) => {
            if(curr[1] != undefined) 
                prev[curr[0]] = curr[1];
            return prev;
        }, {})

        if (payload.answer.length === 1) {
            payload.answer = payload.answer[0];
        }

        if(payload.type === 'torf'){
            if(payload.answer.toLowerCase().trim() === "false") {
                payload.answer = false
            }
            else {
                payload.answer = true;
            }
        }

        onEdit?.({_id, courseNumber, ...payload});
    }

    return (
        
        <div className="yr-edit-question-container">
            {onCancel && showX && ( 
                <div className="d-flex justify-content-end mb-1">
                    <button onClick={() => onCancel()} className="bi bi-x yr-bg-darkest-gray"/>
                </div>
            )}
            <div className="grid">
                <label 
                    type="text" 
                    htmlFor={"edit-prompt"+_id+"input"}
                > Prompt: </label>
                <input 
                    onChange={onChange}
                    type="text" 
                    defaultValue={prompt}
                    name={"prompt"}
                    ref={promptRef}
                    id={"edit-prompt"+_id+"input"}
                    />
                <label 
                    type="text" 
                    htmlFor={"edit-answer"+_id+"input"}
                > Answer (separate by comma): </label>
                <input 
                    onChange={onChange}
                    type="text" 
                    ref={answerRef}
                    defaultValue={answer}
                    name={"answer"}
                    id={"edit-answer"+_id+"input"}
                />
                <label 
                    type="text" 
                    htmlFor={"edit-tags"+_id+"input"}
                > Tags (separate by comma): </label>
                <input 
                    onChange={onChange}
                    type="text" 
                    ref={tagsRef}
                    defaultValue={tags}
                    name={"tags"}
                    id={"edit-tags"+_id+"input"}
                />
                <label 
                    type="text" 
                    htmlFor={"edit-type"+_id+"input"}
                > Type: </label>
                <select 
                    onChange={onChange}
                    type="text" 
                    ref={typeRef}
                    defaultValue={type}
                    name={"type"}
                    id={"edit-type"+_id+"input"}
                >
                    <option value={"torf"}>True or false</option>
                    <option value={"select"}>Select One</option>
                    <option value={"selectMany"}>Select Many</option>
                    <option value={"Text"}>Text</option>
                </select>
                <label 
                    type="text" 
                    htmlFor={"edit-choices"+_id+"input"}
                > Choices (separate by comma): </label>
                <textarea 
                    onChange={onChange}
                    ref={choicesRef}
                    defaultValue={choices}
                    name={"choices"}
                    id={"edit-choices"+_id+"input"}
                />
                <span></span>
                <div>
                    <input
                        type="checkbox"
                        onChange={onChange}
                        ref={toLowerCaseRef}
                        value={toLowerCase}
                        checked={toLowerCase}
                        name={"toLowerCase"}
                        id={"edit-to-lower-case"+_id+"input"}
                    />
                    <label
                        className="ms-2"
                        type="text"
                        htmlFor={"edit-to-lower-case"+_id+"input"}
                    > To lower case</label>
                </div>
                <span></span>
                <div>
                    <input
                        type="checkbox"
                        onChange={onChange}
                        ref={removeFormattingRef}
                        checked={removeFormatting}
                        name={"removeFormatting"}
                        id={"edit-remove-formatting"+_id+"input"}
                    />
                    <label
                        className="ms-2"
                        type="text"
                        htmlFor={"edit-remove-formatting"+_id+"input"}
                    > Remove formattting </label>
                </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
                <button onClick={_onSubmit} className="btn-primary">Submit</button>
            </div>
        </div>
    );
}