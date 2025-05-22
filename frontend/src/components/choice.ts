import { UrlManager } from "../utils/url-manager";
import { CustomHttp } from "../services/custom-http";
import config from "../../config/config";
import { Auth } from "../services/auth";
import { QueryParamsType } from "../types/query-params.type";
import { QuizListType } from "../types/quiz-list.type";
import { TestResultType } from "../types/test-result.type";
import { UserInfoType } from "../types/user-info.type";
import { DefaultResponseType } from "../types/default-response.type";

export class Choice {
    private quizzes: QuizListType[] = [];
    private testResult: TestResultType[] | null = null;
    private routeParams: QueryParamsType;

    constructor() {
        // UrlManager.checkUserData();//проверка на наличии в сессион сторадж данных
        this.routeParams = UrlManager.getQueryParams();
        this.init();
    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(config.host + '/tests');
        } catch (error) {
            console.log(error);
            return
        }

        //Запрос для получения результатов теста пользователей
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result: TestResultType[] | DefaultResponseType = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message)
                    }

                    this.testResult = result as TestResultType[];

                }
            } catch (error) {
                console.log(error);
                return
            }
        }
        this.processQuizzes();
    }

    private processQuizzes(): void {
        const choiceOptionsElement: HTMLElement | null = document.getElementById('choice-options')
        sessionStorage.setItem('allQuizzes', JSON.stringify(this.quizzes));
        if (this.quizzes && this.quizzes.length > 0 && choiceOptionsElement) {
            this.quizzes.forEach((quiz: QuizListType) => {
                const that: Choice = this;
                const choiceOptionElement: HTMLElement | null = document.createElement('div');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id.toString())
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(<HTMLElement>this);
                }

                const choiceOptionTextElement: HTMLElement | null = document.createElement('div');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement: HTMLElement | null = document.createElement('div');
                choiceOptionArrowElement.className = 'choice-option-arrow';


                if (this.testResult) {
                    const result: TestResultType | undefined = this.testResult.find(item => item.testId === quiz.id)
                    if (result) {
                        const choiceOptionResultElement: HTMLElement | null = document.createElement('div');
                        choiceOptionResultElement.className = 'choice-option-result';
                        choiceOptionResultElement.innerHTML = '<div>Результат</div><div>' + result.score + '/' + result.total + '</div>';
                        choiceOptionElement.appendChild(choiceOptionResultElement);
                    }
                }

                const choiceOptionImageElement: HTMLElement | null = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', '/images/arrow.png');


                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            });
        }
    }

    private chooseQuiz(element: HTMLElement): void {
        const dataId: string | null = element.getAttribute('data-id');
        sessionStorage.setItem('activeQuiz', JSON.stringify(dataId));
        if (dataId) {
            location.href = '#/test?id=' + dataId;
        }
    }
}
