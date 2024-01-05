// =========================================

// global var.

const setting_area = document.getElementById("setting_area")
const examing_area = document.getElementById("examing_area")
const grade_area = document.getElementById("grade_area")

const Q_amount_min = 1;
const Q_amount_max = 500;

const exam_time_min = 1;
const exam_time_max = 30;

const Q_template = examing_area.querySelector(".Q_template")
const Q_index_template = examing_area.querySelector(".Q_index_template")

let Q_amount = 0;
let exam_time = 0;

let timer = null; // setInterval(, 1000)

let Q_list = []

let answering = 0

// =========================================

// function

function randint(start, range){
    // return a random int in [start, start + range)
    return (start + Math.floor(Math.random() * range))
}

function question_distribution(){
    const distribute = (amount, category) => {
        let ret = new Array(category)

        for(let i = 0; i < category; i++){
            ret[i] = 0;
        }

        for(let i = 0; i < amount; i++){
            ret[ randint(0, category) ]++;
        }

        return ret
    }

    let Q_distr = distribute(Q_amount, Qs_obj.length)

    for(let i = 0; i < Q_distr.length; i++){
        Q_distr[i] = distribute(Q_distr[i], 2) // 2 part: O/X, choices

        for(let j = 0; j < 2; j++){
            Q_distr[i][j] = (() => {
                let Q_indexes = [] // indexes for choose

                for(let k = 0; k < Qs_obj[i][j].length; k++){
                    Q_indexes.push(k)
                }

                let Q_selections = [] // the choices of questions

                for(let k = 0; k < Q_distr[i][j]; k++){
                    let sel = randint(0, Q_indexes.length)
                    
                    Q_selections.push(Q_indexes[sel])
                    Q_indexes.splice(sel, 1)
                }

                return Q_selections
            })()

            for(let k = 0; k < Q_distr[i][j].length; k++){
                Q_list.push([i, j, Q_distr[i][j][k]]) // [chap, part, index]
            }
        }
    }
}

function question_display(toAnswer){
    Q_list[answering]["Q_inst"].remove()

    Q_list[answering]["Q_btn"].classList.remove("answering")

    answering = toAnswer;

    examing_area.querySelector("#Q_display").appendChild(Q_list[answering]["Q_inst"])

    Q_list[answering]["Q_btn"].classList.add("answering")
}

// =========================================

// event listener

let test_var = "null"

setting_area.querySelector("#setting_submit").addEventListener("click", () => {
    Q_amount = parseInt(setting_area.querySelector("#Q_amount").value)
    exam_time = parseInt(setting_area.querySelector("#exam_time").value)

    if(Q_amount < Q_amount_min || Q_amount > Q_amount_max){
        alert(`做題數量必須介於 ${Q_amount_min} 到 ${Q_amount_max} 之間，請重新設定！`)
    }
    else if(exam_time < exam_time_min || exam_time > exam_time_max){
        alert(`答題時間(分鐘)必須介於 ${exam_time_min} 到 ${exam_time_max} 之間，請重新設定！`)
    }
    else {
        // determine the exam questions
        question_distribution();

        for(let i = 0; i < Q_list.length; i++){
            // create Q_template
            let Q_content = Qs_obj[ Q_list[i][0] ][ Q_list[i][1] ][ Q_list[i][2] ]

            let Q_template_inst = Q_template.cloneNode(true) // a node with real question

            test_var = Q_template_inst

            Q_template_inst.querySelector(".Q_statement").textContent = Q_content["Q_statement"]

            let choice_template = Q_template_inst.querySelector(".choice_template")
            choice_template.remove()

            for(let j = 0; j < Q_content["Q_choices"].length; j++){
                let choice = choice_template.cloneNode(true)

                choice.querySelector(".choice_choose").value = `${j}`

                choice.querySelector(".choice_statement").textContent = ""
                choice.querySelector(".choice_statement").appendChild((() => {
                    let ele = document.createElement("span");
                    ele.textContent = Q_content["Q_choices"][j]
                    
                    return ele
                })())

                Q_template_inst.querySelector(".Q_choices").appendChild(choice)
            }
            
            // create button
            let Q_index_inst = Q_index_template.cloneNode(true)
            Q_index_inst.textContent = `${i + 1}`

            Q_index_inst.addEventListener("click", () => {
                question_display(i)
            })

            examing_area.querySelector("#Q_list").appendChild(Q_index_inst)

            if(i == 0){
                examing_area.querySelector("#Q_display").appendChild(Q_template_inst)

                Q_index_inst.classList.add("answering")
            }

            // update to Q_list
            let Q_info = {
                "Q_btn" : Q_index_inst,
                "Q_inst" : Q_template_inst,
                "Expl" : Q_content["Expl"],
                "Q_order" : [ Q_list[i][0], Q_list[i][1], Q_content["Q_index"] ]
            }

            Q_list[i] = Q_info;
        }
        
        setting_area.remove()
        document.body.appendChild(examing_area)

        // set exam time
        let left_time_val = exam_time * 60
        const left_time_ele = examing_area.querySelector("#left_time")

        timer = setInterval(() => {
            if(left_time_val > 0){
                left_time_val--;

                left_time_ele.textContent = `${(Math.floor(left_time_val / 60)).toString().padStart(2, "0")}:${(left_time_val % 60).toString().padStart(2, "0")}`;
            }
            else {
                clearInterval(timer)

                let buttons = examing_area.querySelectorAll("button:not(#answers_submit)");
                for (let btn of buttons){
                    btn.disabled = true;
                }
                
                for(let question of Q_list){
                    choices = question["Q_inst"].querySelectorAll(".choice_choose")
                    
                    for(let ch of choices){
                        ch.disabled = true; 
                    }
                }

                alert("時間到！請交卷！\n(按下下方的 \"交卷！\" 按鈕即可送出答案)")
            }
        }, 1000)
    }
})

examing_area.querySelector("#prev").addEventListener("click", () => {
    if(answering > 0){
        question_display(answering - 1)
    }
})

examing_area.querySelector("#next").addEventListener("click", () => {
    if(answering < Q_amount - 1){
        question_display(answering + 1)
    }
})

examing_area.querySelector("#answers_submit").addEventListener("click", () => {
    // grading
})

// =========================================

// main

examing_area.remove()
grade_area.remove()

Q_template.remove()
Q_index_template.remove()
