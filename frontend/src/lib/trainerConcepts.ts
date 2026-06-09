import type { Exercise, TrainerTopic } from './api'

export type BuiltInTrainerConcept = TrainerTopic & {
  summary: string
  expectedOutput: string
  microSkills: string[]
  commonMistakes: string[]
  relatedSprint?: string
}

type TrainerLessonMatchInput = {
  module?: string
  category?: string
  title?: string
  description?: string
}

function exercise(
  id: number,
  title: string,
  description: string,
  category: string,
  starterCode: string,
  hints: string[] = []
): Exercise {
  return {
    id,
    level: 'beginner',
    module: 'core',
    title,
    description,
    difficulty: 'easy',
    category,
    starterCode,
    trainerLayout: '',
    hints: JSON.stringify(hints),
    order: Math.abs(id),
  }
}

export const builtInTrainerConcepts: BuiltInTrainerConcept[] = [
  {
    id: -1,
    module: 'core',
    title: 'Пакеты, переменные и функции',
    slug: 'basics',
    summary: 'Точка входа в Go: package main, import, короткое объявление переменных и функции с возвращаемым значением.',
    explanation:
      'В реальной работе почти любая фича начинается не с “магии”, а с трёх вещей: где живёт код, какие данные приходят и какая функция это поведение собирает. Если этот каркас понятен, дальше учиться сильно проще.',
    syntax: `package main

import "fmt"

const product = "Godemy"

func greeting(name string) string {
	return "Привет, " + name + "!"
}

func main() {
	user := "Gopher"
	fmt.Println(greeting(user))
}`,
    examples: JSON.stringify([
      {
        title: 'Короткое объявление переменной',
        code: `name := "Gopher"
count := 3
fmt.Println(name, count)`,
        description: 'Оператор := удобен, когда ты сразу задаёшь значение и не хочешь писать тип вручную.',
      },
      {
        title: 'Функция как маленький контракт',
        code: `func discount(price int) int {
	return price - 100
}`,
        description: 'Имя функции должно объяснять действие, а возвращаемый тип — что ты получишь на выходе.',
      },
    ]),
    patterns: `func action(input Type) ResultType {
	result := transform(input)
	return result
}`,
    order: 1,
    expectedOutput: 'Привет, Gopher!',
    microSkills: [
      'понимать структуру файла Go',
      'создавать переменные через := и const',
      'читать сигнатуру функции как контракт',
    ],
    commonMistakes: [
      'путают package main и имя пакета библиотеки',
      'возвращают пустую строку вместо результата',
      'пытаются всё писать прямо в main без функций',
    ],
    relatedSprint: 'Sprint 0 · Онбординг и первый CLI-flow',
    exercises: [
      exercise(
        -1,
        'Персональное приветствие',
        'Создай функцию Greeting(name string) string, которая возвращает строку «Привет, <имя>!». В main вызови её для Gopher.',
        'Основы',
        `package main

import "fmt"

func Greeting(name string) string {
	// TODO: верни персональное приветствие
	return ""
}

func main() {
	fmt.Println(Greeting("Gopher"))
}
`,
        [
          'Сначала собери строку внутри функции, а потом уже печатай её в main.',
          'В Go нет шаблонных строк как в JS — на старте проще использовать конкатенацию.',
          'Функция должна возвращать результат, а не печатать его сама.',
        ]
      ),
    ],
  },
  {
    id: -2,
    module: 'core',
    title: 'Условия и ветвления',
    slug: 'conditionals',
    summary: 'if, else, switch и guard clauses — основа для понятной бизнес-логики без лишней вложенности.',
    explanation:
      'Любой продуктовый сценарий — это серия решений: доступ разрешён или нет, число больше или меньше, пользователь ввёл корректные данные или нет. Чем проще ты формулируешь ветвления, тем легче поддерживать код и объяснять его на ревью.',
    syntax: `if score >= 80 {
	fmt.Println("Отлично")
} else if score >= 60 {
	fmt.Println("Хорошо")
} else {
	fmt.Println("Попробуй ещё")
}`,
    examples: JSON.stringify([
      {
        title: 'Ранний возврат вместо вложенности',
        code: `func access(age int) string {
	if age < 18 {
		return "denied"
	}
	return "allowed"
}`,
        description: 'Guard clause делает код короче и лучше читается глазами ментора.',
      },
      {
        title: 'switch для статусов',
        code: `func badge(level string) string {
	switch level {
	case "junior":
		return "🌱"
	case "middle":
		return "⚙️"
	default:
		return "🚀"
	}
}`,
        description: 'switch удобен, когда сценариев несколько и они взаимоисключающие.',
      },
    ]),
    patterns: `func Decide(value int) string {
	if <условие> {
		return <результат>
	}
	return <результат по умолчанию>
}`,
    order: 2,
    expectedOutput: 'positive',
    microSkills: [
      'писать if без лишних скобок',
      'использовать ранний return',
      'выбирать между if и switch',
    ],
    commonMistakes: [
      'делают глубокую вложенность вместо раннего выхода',
      'не покрывают сценарий по умолчанию',
      'смешивают вычисление и вывод в одну кучу',
    ],
    relatedSprint: 'Sprint 1 · Number Guessing Game',
    exercises: [
      exercise(
        -2,
        'Определи знак числа',
        'Реализуй Sign: positive для положительного числа, negative для отрицательного и zero для нуля.',
        'Условия',
        `package main

import "fmt"

func Sign(number int) string {
	// TODO
	return ""
}

func main() {
	fmt.Println(Sign(7))
}
`,
        [
          'Подумай о трёх взаимоисключающих состояниях: больше нуля, меньше нуля и ровно ноль.',
          'Сначала проверь самый специфичный сценарий, затем остальные.',
          'Функция должна возвращать только одно слово без fmt внутри.',
        ]
      ),
    ],
  },
  {
    id: -3,
    module: 'core',
    title: 'Циклы и range',
    slug: 'loops',
    summary: 'for и range помогают обрабатывать данные шаг за шагом: считать, фильтровать, находить и накапливать.',
    explanation:
      'Когда проект становится чуть живее, ты почти сразу начинаешь проходить по коллекциям: искать значение, суммировать, валидировать ввод, считать статистику. В Go для этого есть один цикл — и это хорошо, потому что правила проще.',
    syntax: `total := 0
for _, number := range numbers {
	total += number
}`,
    examples: JSON.stringify([
      {
        title: 'Сумма чисел',
        code: `func Sum(numbers []int) int {
	total := 0
	for _, number := range numbers {
		total += number
	}
	return total
}`,
        description: 'Подчёркивание игнорирует индекс, если он не нужен.',
      },
      {
        title: 'Поиск первого совпадения',
        code: `func FindGo(words []string) bool {
	for _, word := range words {
		if word == "go" {
			return true
		}
	}
	return false
}`,
        description: 'Часто можно завершить цикл раньше, если нужный результат уже найден.',
      },
    ]),
    patterns: `result := initialValue
for _, item := range collection {
	result = update(result, item)
}
return result`,
    order: 3,
    expectedOutput: '10',
    microSkills: [
      'использовать range для прохода по слайсу',
      'накапливать результат в переменной',
      'останавливать цикл, когда цель уже достигнута',
    ],
    commonMistakes: [
      'инициализируют счётчик внутри цикла и обнуляют прогресс',
      'пытаются мутировать не ту переменную',
      'забывают вернуть накопленный результат после цикла',
    ],
    relatedSprint: 'Sprint 1 · Number Guessing Game',
    exercises: [
      exercise(
        -3,
        'Сумма чётных чисел',
        'Верни сумму только чётных чисел из слайса.',
        'Циклы',
        `package main

import "fmt"

func SumEven(numbers []int) int {
	// TODO
	return 0
}

func main() {
	fmt.Println(SumEven([]int{1, 2, 3, 4}))
}
`,
        [
          'Тебе нужна переменная-накопитель и проход по каждому числу.',
          'Добавляй число в сумму только если оно делится на 2 без остатка.',
          'Ожидаемый вывод должен получиться без ручной подстановки числа 10.',
        ]
      ),
    ],
  },
  {
    id: -4,
    module: 'core',
    title: 'Слайсы и map',
    slug: 'collections',
    summary: 'Слайсы нужны для списков, map — для быстрых поисков и счётчиков. Вместе они закрывают половину бытовых задач.',
    explanation:
      'В продуктовой разработке ты почти всегда работаешь либо со списками, либо со словарями: массив задач, список расходов, карта статусов, индекс по email. Чем раньше ты начинаешь мыслить коллекциями, тем быстрее перестаёшь писать хрупкий код.',
    syntax: `names := []string{"Ana", "Bob"}
names = append(names, "Kim")

scores := map[string]int{
	"Ana": 10,
	"Bob": 8,
}`,
    examples: JSON.stringify([
      {
        title: 'Подсчёт повторений',
        code: `func Count(words []string) map[string]int {
	result := make(map[string]int)
	for _, word := range words {
		result[word]++
	}
	return result
}`,
        description: 'Map удобно использовать как счётчик частот.',
      },
      {
        title: 'Фильтрация значений',
        code: `func PositiveOnly(numbers []int) []int {
	result := make([]int, 0)
	for _, n := range numbers {
		if n > 0 {
			result = append(result, n)
		}
	}
	return result
}`,
        description: 'append помогает собирать новый слайс из подходящих элементов.',
      },
    ]),
    patterns: `result := make(map[Key]Value)
for _, item := range items {
	result[key(item)] = value(item)
}
return result`,
    order: 4,
    expectedOutput: '2',
    microSkills: [
      'добавлять элементы в слайс через append',
      'создавать map через make',
      'использовать map как счётчик или индекс',
    ],
    commonMistakes: [
      'пытаются записывать в nil map',
      'мутируют исходный список, когда нужен новый',
      'забывают, что у map нет гарантированного порядка обхода',
    ],
    relatedSprint: 'Sprint 3 · Expense Tracker',
    exercises: [
      exercise(
        -4,
        'Посчитай слово',
        'Верни, сколько раз слово go встречается в слайсе.',
        'Коллекции',
        `package main

import "fmt"

func CountGo(words []string) int {
	// TODO
	return 0
}

func main() {
	fmt.Println(CountGo([]string{"go", "rust", "go"}))
}
`,
        [
          'Самый короткий путь здесь — обычный цикл и счётчик, map не обязателен.',
          'Сравнивай каждый элемент со строкой "go".',
          'Функция должна вернуть только количество совпадений.',
        ]
      ),
    ],
  },
  {
    id: -5,
    module: 'core',
    title: 'Struct и методы',
    slug: 'structs',
    summary: 'Struct помогает собрать связанные данные в один объект, а методы делают поведение ближе к этим данным.',
    explanation:
      'Как только в проекте появляется сущность вроде User, Expense или WeatherResponse, разрозненные переменные становятся неудобными. Struct позволяет описывать реальные объекты предметной области, а методы — добавлять им понятное поведение.',
    syntax: `type Expense struct {
	Title  string
	Amount int
}

func (e Expense) Label() string {
	return e.Title
}`,
    examples: JSON.stringify([
      {
        title: 'Struct как модель данных',
        code: `type User struct {
	Name  string
	Email string
}`,
        description: 'Struct особенно полезен, когда поля логически относятся к одной сущности.',
      },
      {
        title: 'Метод для готового поведения',
        code: `func (u User) DisplayName() string {
	return u.Name + " <" + u.Email + ">"
}`,
        description: 'Метод даёт удобный интерфейс поверх сырых полей.',
      },
    ]),
    patterns: `type Entity struct {
	Field Type
}

func (e Entity) Method() ReturnType {
	return result
}`,
    order: 5,
    expectedOutput: 'Coffee: 350',
    microSkills: [
      'создавать свои типы через struct',
      'думать сущностями, а не россыпью переменных',
      'выносить повторяемую логику в методы',
    ],
    commonMistakes: [
      'дают struct слишком абстрактные названия вроде Data или Item',
      'смешивают поля и поведение разных сущностей в одном типе',
      'не используют методы там, где они улучшают читаемость',
    ],
    relatedSprint: 'Sprint 3 · Expense Tracker',
    exercises: [
      exercise(
        -5,
        'Карточка расхода',
        'Создай struct Expense с полями Title и Amount, а затем метод Summary() string, который вернёт "Coffee: 350".',
        'Struct',
        `package main

import "fmt"

type Expense struct {
	// TODO
}

func (e Expense) Summary() string {
	// TODO
	return ""
}

func main() {
	expense := Expense{Title: "Coffee", Amount: 350}
	fmt.Println(expense.Summary())
}
`,
        [
          'Сначала опиши поля struct, потом добавь метод.',
          'Метод Summary должен работать на значении Expense и собирать строку из полей.',
          'Для числа Amount можно использовать fmt.Sprint или fmt.Sprintf.',
        ]
      ),
    ],
  },
  {
    id: -6,
    module: 'core',
    title: 'Ошибки и защитные проверки',
    slug: 'errors',
    summary: 'Хороший Go-код не скрывает проблемы: он явно проверяет ошибки и быстро завершает невалидный сценарий.',
    explanation:
      'Когда ты начинаешь читать файл, работать с сетью или разбирать ввод пользователя, идеальных данных больше нет. Ошибки — это нормальная часть потока. Важна не их “красота”, а предсказуемость: проверил, обработал, вернул наверх.',
    syntax: `value, err := strconv.Atoi(input)
if err != nil {
	return 0, err
}`,
    examples: JSON.stringify([
      {
        title: 'Guard clause для валидации',
        code: `func ValidateName(name string) error {
	if name == "" {
		return errors.New("name is required")
	}
	return nil
}`,
        description: 'Проверка на входе помогает остановить плохой сценарий до основной логики.',
      },
      {
        title: 'Проброс ошибки наверх',
        code: `func ParseAge(raw string) (int, error) {
	age, err := strconv.Atoi(raw)
	if err != nil {
		return 0, err
	}
	return age, nil
}`,
        description: 'Не проглатывай ошибку — возвращай её вызывающему коду.',
      },
    ]),
    patterns: `result, err := doSomething()
if err != nil {
	return fallback, err
}
return result, nil`,
    order: 6,
    expectedOutput: 'name is required',
    microSkills: [
      'использовать if err != nil как норму, а не исключение',
      'делать простые проверки до основной логики',
      'возвращать осмысленные сообщения об ошибках',
    ],
    commonMistakes: [
      'игнорируют err и продолжают работать с плохими данными',
      'возвращают пустой результат без объяснения причины',
      'кладут слишком много логики внутрь одной проверки',
    ],
    relatedSprint: 'Sprint 2 · Weather API Wrapper Service',
    exercises: [
      exercise(
        -6,
        'Проверь пустое имя',
        'Если name пустой, верни ошибку "name is required". Иначе верни nil.',
        'Ошибки',
        `package main

import (
	"errors"
	"fmt"
)

func ValidateName(name string) error {
	// TODO
	return nil
}

func main() {
	err := ValidateName("")
	if err != nil {
		fmt.Println(err.Error())
	}
}
`,
        [
          'Здесь не нужен сложный flow: одна проверка и один ранний return.',
          'Для создания ошибки используй errors.New("name is required").',
          'Если имя валидно, функция должна вернуть nil.',
        ]
      ),
    ],
  },
  {
    id: -7,
    module: 'core',
    title: 'HTTP, JSON и внешние API',
    slug: 'json-http',
    summary: 'Почти любой современный backend общается по HTTP и передаёт данные через JSON — это мост к реальным сервисам.',
    explanation:
      'На этом этапе Go перестаёт быть просто языком для маленьких CLI-утилит и становится инструментом для интеграций. Ты учишься читать JSON, описывать ответ через struct и думать не только о коде, но и о контрактах между сервисами.',
    syntax: `type WeatherResponse struct {
	City string \`json:"city"\`
	Temp int    \`json:"temp"\`
}

func endpoint(city string) string {
	return "/weather?city=" + city
}`,
    examples: JSON.stringify([
      {
        title: 'Struct под JSON-ответ',
        code: `type UserResponse struct {
	ID    int    \`json:"id"\`
	Email string \`json:"email"\`
}`,
        description: 'JSON-теги помогают связать поля Go со схемой ответа сервиса.',
      },
      {
        title: 'Сборка простого endpoint',
        code: `func weatherURL(city string) string {
	return "https://api.example.com/weather?city=" + city
}`,
        description: 'До реального HTTP-запроса важно хотя бы уверенно собрать корректный URL и понять контракт.',
      },
    ]),
    patterns: `type Response struct {
	Field Type \`json:"field"\`
}

func buildURL(param string) string {
	return baseURL + "?q=" + param
}`,
    order: 7,
    expectedOutput: '/weather?city=moscow',
    microSkills: [
      'описывать JSON-ответы через struct',
      'использовать json-теги',
      'мыслить API как контрактом между системами',
    ],
    commonMistakes: [
      'не совпадают имена json-тегов и полей ответа',
      'смешивают модель ответа и внутреннюю бизнес-логику',
      'пытаются сразу строить огромный сервис, не поняв контракт',
    ],
    relatedSprint: 'Sprint 2 · Weather API Wrapper Service',
    exercises: [
      exercise(
        -7,
        'Собери endpoint погоды',
        'Реализуй функцию WeatherPath(city string) string, которая вернёт путь /weather?city=<город>.',
        'HTTP и JSON',
        `package main

import "fmt"

func WeatherPath(city string) string {
	// TODO
	return ""
}

func main() {
	fmt.Println(WeatherPath("moscow"))
}
`,
        [
          'Пока не нужен реальный http.Client — только понятная строка endpoint.',
          'Собери путь через конкатенацию так, чтобы city попал в query-параметр.',
          'Следи за точным форматом: /weather?city=moscow.',
        ]
      ),
    ],
  },
]

const conceptKeywordMap: Record<string, string[]> = {
  basics: ['онбординг', 'первый день', 'первая задача', 'основы', 'cli', 'функц', 'пакет'],
  conditionals: ['услов', 'ветв', 'guess', 'числ', 'логик', 'валидац'],
  loops: ['цикл', 'range', 'итерац', 'guess', 'повтор', 'счет'],
  collections: ['слайс', 'map', 'коллекц', 'расход', 'expense', 'список', 'данн'],
  structs: ['struct', 'сущност', 'модель', 'expense', 'weather', 'пользоват'],
  errors: ['ошиб', 'валидац', 'api', 'weather', 'network', 'провер'],
  'json-http': ['http', 'json', 'api', 'weather', 'endpoint', 'интеграц', 'service'],
}

export function getBuiltInTrainerConcept(slug: string): BuiltInTrainerConcept | undefined {
  return builtInTrainerConcepts.find((concept) => concept.slug === slug)
}

export function isBuiltInExercise(exerciseId: number): boolean {
  return exerciseId < 0
}

export function getRecommendedTrainerConcepts(input: TrainerLessonMatchInput): BuiltInTrainerConcept[] {
  const haystack = [input.module, input.category, input.title, input.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const scored = builtInTrainerConcepts
    .map((concept) => {
      const keywords = conceptKeywordMap[concept.slug] || []
      const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0)
      return { concept, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.concept.order - b.concept.order)
    .map((item) => item.concept)

  if (scored.length > 0) {
    return scored.slice(0, 3)
  }

  return builtInTrainerConcepts.filter((concept) => ['basics', 'loops', 'collections'].includes(concept.slug))
}
