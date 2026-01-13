// src/FitText.js
import React, { useLayoutEffect, useRef } from "react";

/**
 * FitText: scales child text to the largest size that fits inside its container (no overflow).
 * Usage:
 *   <div style={{height:80}}>
 *     <FitText max={56} min={18}><span>✨ Learning Portal</span></FitText>
 *   </div>
 */
export default function FitText(props) {
    var children = props.children;
    var max = props.max == null ? 48 : props.max;
    var min = props.min == null ? 14 : props.min;
    var step = props.step == null ? 1 : props.step;
    var weight = props.weight == null ? "800" : props.weight;
    var className = props.className || "";

    var parentRef = useRef(null);
    var textRef = useRef(null);

    useLayoutEffect(function () {
        var parent = parentRef.current;
        var el = textRef.current;
        if (!parent || !el) return;

        function fit() {
            if (!parent || !el) return;
            var size = max;
            el.style.whiteSpace = "nowrap";
            el.style.display = "inline-block";
            el.style.fontWeight = String(weight);
            el.style.fontSize = size + "px";
            // shrink until both width & height fit
            // guard loop
            var guard = 0;
            while (guard < 200 && size > min && (el.scrollWidth > parent.clientWidth || el.scrollHeight > parent.clientHeight)) {
                size -= step;
                el.style.fontSize = size + "px";
                guard++;
            }
        }

        fit();
        var ro;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(fit);
            ro.observe(parent);
        }
        window.addEventListener("resize", fit);
        return function () {
            window.removeEventListener("resize", fit);
            if (ro) ro.disconnect();
        };
    }, [max, min, step, weight]);

    return (
        <div ref={parentRef} className={"fittext " + className} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <div ref={textRef} style={{ lineHeight: 1.1 }}>{children}</div>
        </div>
    );
}
