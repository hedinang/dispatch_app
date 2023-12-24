import React, { Component } from 'react';
import styles from './styles';
import Moment from 'react-moment';

import { AxlButton, AxlPanel } from 'axl-reactjs-ui';

class QuizResult extends Component {

    _renderAnswer(answer, answers) {
        const isSelected = answers && answers.indexOf(answer.value) >= 0
        return <div key={answer.value} style={{textAlign: 'left', padding: '4px 8px 4px 4px', color: isSelected ? '#22e' : '#222'}}>
            { isSelected && <span style={{fontSize: '18px'}}>&#9745;</span>}
            { !isSelected && <span style={{color: '#888',fontSize: '18px'}}>&#9744;</span>}
            <span style={{fontWeight: 'bold'}}>{answer.title} </span>
            <span style={{ fontWeight: isSelected ? 'bold':'normal' }}>{answer.text}</span>
            { answer.points !== null && answer.points !== undefined && <span>   ({answer.points})</span>}
        </div>
    }

    _renderQuestion(question, answers) {
        return <div key={question.id} style={{textAlign: 'left', paddingLeft: '8px'}}>
            <h5>{question.title}</h5>
            <p style={{fontStyle: 'italic'}}>{question.text}</p>
            { question.choices && question.choices.map(a => this._renderAnswer(a, answers[question.id]))}
        </div>
    }

    _renderSection(section, answers) {
        return <div key={section.id} style={{textAlign: 'left', padding: '8px'}}>
            <h4>{section.title}</h4>
            <p style={{fontStyle: 'italic'}}>{section.text}</p>
            { section.questions && section.questions.map(q => this._renderQuestion(q, answers)) }
            { section.sub_sections && section.sub_sections.map(q => this._renderSection(q, answers)) }
        </div>
    }

    render() {
        const { registration } = this.props
        const { quiz } = registration
        const { questionnaire, answers } = quiz
        console.log(questionnaire)
        return <div>
            <h3>{questionnaire.title}</h3>
            <p>{questionnaire.text}</p>
            <div>
                Driver: { registration.driver.first_name } { registration.driver.last_name }
            </div>
            <div>
                {registration.quiz.start && <span>Start: <b><Moment format={'DD MMM, hh:mm a'}>{registration.quiz.start}</Moment></b>  </span>}
                {registration.quiz.end && <span> Finish: <b><Moment format={'hh:mm a'}>{registration.quiz.end}</Moment></b>  </span>}
                Grade: <b>{registration.record.quiz_grade}</b>
            </div>
            { this._renderSection(questionnaire.main, answers) }
        </div>
    }
}

export default QuizResult