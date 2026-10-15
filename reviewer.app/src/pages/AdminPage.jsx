import { useEffect, useRef, useState, useCallback } from "react"
import { get, post } from "../inf/httpClient"
import { useCourses } from "../api/queries/queries";



export const AdminPage = () => {
    const {data: courses} = useCourses();
    const courseRef = useRef(null);
    const questionRef = useRef(null);

    const postQuestion = () => {
        const course = courseRef.current.value;
        var reader = new FileReader();
        reader.readAsText(questionRef.current.files[0], "UTF-8")
        reader.onload = (a) => {
            post(`/${course}/questions` , a.target.result)
        }
    }

    return (
        <div>
            <select ref={courseRef}>
                {
                    courses.map(c => (
                        <option key={c.number} value={c.number}>{c.number} {c.name}</option>
                    ))
                }
            </select>
            <label htmlFor="question-builder">New Question:</label>
            <input type="file" ref={questionRef}/>
            <button onClick={postQuestion}>Create</button>
        </div>
    )
}
