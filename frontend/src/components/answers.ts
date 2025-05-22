import { UrlManager } from "../utils/url-manager";
import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { Auth } from "../services/auth";
import { QueryParamsType } from "../types/query-params.type";
import { UserInfoType } from "../types/user-info.type";
import { DefaultResponseType } from "../types/default-response.type";
import { PassTestResponseType } from "../types/pass-test-response.type";
import { QuizAnswerType, QuizType } from "../types/quiz.type";
import { UserResultType } from "../types/user-result.type";

export class Answers {
    private quiz: QuizType | null;
    private routeParams: QueryParamsType;
    constructor() {
        this.quiz = null;
        // UrlManager.checkUserData();
        this.routeParams = UrlManager.getQueryParams(); // Получаем параметры из URL
        this.init();
        const checkResultElement: HTMLElement | null = document.getElementById('check-result');
        if (checkResultElement) {
            checkResultElement.addEventListener('click', () => this.checkResult());
        }

    }

    async init() {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }

        // Проверяем, есть ли параметр id в URL
        const testId: string | undefined = this.routeParams.id;
        if (!testId) {
            location.href = '#/';
            return;
        }

        try {
            // Делаем запрос на новый API эндпоинт с использованием параметра id
            const result: DefaultResponseType | PassTestResponseType | any = await CustomHttp.request(`${config.host}/tests/${testId}/result/details?userId=${userInfo.userId}`);
console.log(result);
            if (result && result.test) {
                this.quiz = result.test;
                sessionStorage.setItem('quizData', JSON.stringify(this.quiz));
                this.showAnswers();
            } else {
                location.href = '#/';
            }
        } catch (e) {
            location.href = '#/';
        }
    }

    showAnswers() {
        if (!this.quiz) return;
        const selectedQuizQuestions = this.quiz.questions;
        const userInfoString: string | null = localStorage.getItem('userInfo');
        const fullName: string = userInfoString ? JSON.parse(userInfoString).fullName : 'Неизвестный пользователь';
        
        const emailUser: string | null = localStorage.getItem('userEmail') || 'Неизвестный email';

        console.log(selectedQuizQuestions);

        const testNameElement = document.getElementById('test-name');
        const testUserNameSpanElement = document.getElementById('test-username-span');
        
        if (testNameElement && testUserNameSpanElement) {
            testNameElement.innerText = this.quiz.name;
            testUserNameSpanElement.innerText = `${fullName}`, `${emailUser}`;
        }
        selectedQuizQuestions.forEach((question, index) => {
            this.displayQuestionAndAnswers(question.question, question.answers, question.id, index + 1);
        });
    }

    displayQuestionAndAnswers(
        question: string,
        answers: QuizAnswerType[],
        questionId: number,
        questionNumber: number
    ): void {
        const userResult: UserResultType[] = JSON.parse(sessionStorage.getItem('userResult') || '[]');
        const questionContainer = document.createElement('div');
        questionContainer.classList.add('test-question');
    
        const questionTitle = document.createElement('div');
        questionTitle.classList.add('test-question-title');
    
        const questionNumberSpan = document.createElement('span');
        questionNumberSpan.textContent = `Вопрос ${questionNumber}: `;
    
        questionTitle.appendChild(questionNumberSpan);
        questionTitle.innerHTML += question;
    
        const questionOptions = document.createElement('div');
        questionOptions.classList.add('test-question-options');
    
        answers.forEach((answer) => {
            const answerContainer = document.createElement('div');
            answerContainer.classList.add('test-question-answer');
    
            const answerCircle = document.createElement('div');
            answerCircle.classList.add('test-question-answer-circle');
    
            const answerText = document.createElement('div');
            answerText.classList.add('test-question-answer-text');
            answerText.innerText = answer.answer;
    
            const userAnswer = userResult.find((result) => result.questionId === questionId);
    
            if (userAnswer && userAnswer.chosenAnswerId === answer.id) {
                if (answer.correct) {
                    answerContainer.classList.add('right-answer');
                } else {
                    answerContainer.classList.add('wrong-answer');
                }
            }
    
            if (answer.correct) {
                answerContainer.classList.add('correct-answer');
            }
    
            answerContainer.appendChild(answerCircle);
            answerContainer.appendChild(answerText);
            questionOptions.appendChild(answerContainer);
        });
    
        questionContainer.appendChild(questionTitle);
        questionContainer.appendChild(questionOptions);
    
        const testQuestionsList = document.getElementsByClassName('test-questions-list')[0];
        if (testQuestionsList) {
            testQuestionsList.appendChild(questionContainer);
        } else {
            console.error('Element with class "test-questions-list" not found.');
        }
    }

    checkResult() {
        // Перенаправляем на страницу результата с параметром id
        location.href = `#/result?id=${this.routeParams.id}`;
    }
}



