import React, { Children, forwardRef, useImperativeHandle, useMemo, useState } from "react";
import ReactDOM from "react-dom"

export const Portal = forwardRef(({children, type, visible, shadow, onClose}, ref) => {
    const [ _visible, setVisible ] = useState(visible);

    const css = useMemo(() => {
        switch(type) {
            case "left": return "left-panel"
            case "right": return "right-panel"
            case "top": return "top-panel"
            case "bottom": return "bottom-panel"
            default: 
             return "yr-modal"
        }
    }, [type])

    const show = () => setVisible(true);
    const hide = () => {
        setVisible(false)
        onClose?.()
    };
    useImperativeHandle(ref, () => ({
       show,
       hide
    }), [])

    return (
        <div className={"yr-portal " + css + " " + (_visible?"show":"hide")}>
            <div className={`yr-portal-content ${css} ${(_visible?"show":"hide")} ${(shadow?"shadow":"")}`}>
                <button onClick={hide} className="position-absolute top-0 end-0 bi bi-x bg-transparent yr-text-light text-shadow"></button>
                {children}
            </div>
        </div>
    )
})