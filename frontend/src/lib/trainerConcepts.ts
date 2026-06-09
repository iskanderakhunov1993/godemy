import type { Exercise, TrainerTopic } from './api'

export type ConceptSection = {
  title: string
  paragraphs: string[]
  code?: string
}

export type PracticeRailItem = {
  title: string
  description: string
  difficulty: 'easy' | 'medium'
  status: 'recommended' | 'learning' | 'locked'
}

export type BuiltInTrainerConcept = TrainerTopic & {
  summary: string
  expectedOutput: string
  microSkills: string[]
  commonMistakes: string[]
  relatedSprint?: string
  conceptCode: string
  sections: ConceptSection[]
  practiceRail: PracticeRailItem[]
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

function rail(
  title: string,
  description: string,
  status: PracticeRailItem['status'],
  difficulty: PracticeRailItem['difficulty'] = 'easy'
): PracticeRailItem {
  return { title, description, status, difficulty }
}

export const builtInTrainerConcepts: BuiltInTrainerConcept[] = [
  {
    id: -1,
    module: 'core',
    title: 'Basics',
    slug: 'basics',
    conceptCode: 'Ba',
    summary: 'Пакеты, переменные, константы и функции — базовый скелет любой программы на Go.',
    explanation:
      'Этот концепт даёт три главных строительных блока Go: packages, variables и functions. Если они понятны, все следующие темы ложатся гораздо легче.',
    syntax: `package main

import "fmt"

const language = "Go"

func greeting(name string) string {
	return "Привет, " + name + "!"
}

func main() {
	user := "Gopher"
	fmt.Println(greeting(user))
}`,
    examples: JSON.stringify([
      {
        title: 'Функция с возвратом',
        code: `func double(value int) int {
	return value * 2
}`,
        description: 'Сигнатура функции сразу показывает, что она принимает и что возвращает.',
      },
      {
        title: 'Короткое объявление',
        code: `name := "gopher"
count := 3`,
        description: 'Через := удобно быстро создавать переменные с понятным стартовым значением.',
      },
    ]),
    patterns: `func action(input Type) ResultType {
	result := transform(input)
	return result
}`,
    order: 1,
    expectedOutput: 'Привет, Gopher!',
    microSkills: [
      'читать структуру Go-файла сверху вниз',
      'понимать роль package и import',
      'отделять функции от вывода в main',
    ],
    commonMistakes: [
      'кладут всю логику прямо в main',
      'не понимают, что const и var служат разным целям',
      'печатают результат внутри функции вместо return',
    ],
    relatedSprint: 'Sprint 0 · Онбординг и первый CLI-flow',
    sections: [
      {
        title: 'About Basics',
        paragraphs: [
          'Go — статически типизированный компилируемый язык. На практике это значит, что структура программы обычно читается быстро, а ошибки по типам ловятся рано.',
          'В Basics мы знакомимся с тем, как вообще устроен файл программы: package, import, values и functions.',
        ],
      },
      {
        title: 'Packages',
        paragraphs: [
          'Код в Go организован по пакетам. Один файл почти всегда начинается с package, чтобы компилятор понял, к какому модулю он относится.',
          'Для учебных CLI-задач мы почти всегда начинаем с package main, потому что именно он даёт точку входа в программу.',
        ],
        code: `package main

import "fmt"`,
      },
      {
        title: 'Variables and constants',
        paragraphs: [
          'Переменные в Go имеют тип. Ты можешь указать его явно, а можешь дать компилятору вывести его из значения.',
          'Константы нужны для значений, которые не должны меняться во время работы программы.',
        ],
        code: `var explicit int = 21
implicit := 10
const brand = "Godemy"`,
      },
      {
        title: 'Functions',
        paragraphs: [
          'Функции собирают поведение в предсказуемые блоки. Хорошая функция отвечает на один вопрос и возвращает один понятный результат.',
          'На старте важно привить привычку: функция вычисляет, а main запускает и печатает.',
        ],
        code: `func greeting(name string) string {
	return "Привет, " + name + "!"
}`,
      },
    ],
    practiceRail: [
      rail('Gopher\'s First Greeting', 'Собери первую функцию с параметром и возвратом строки.', 'recommended'),
      rail('Package Names', 'Пойми, почему package main нужен для запускаемой программы.', 'learning'),
      rail('Constants Clinic', 'Попрактикуй значения, которые нельзя менять.', 'locked'),
      rail('Function Signatures', 'Закрепи сигнатуры и возвращаемые типы.', 'locked'),
    ],
    exercises: [
      exercise(
        -1,
        'Персональное приветствие',
        'Создай функцию Greeting(name string) string, которая возвращает строку «Привет, <имя>!». В main вызови её для Gopher.',
        'Basics',
        `package main

import "fmt"

func Greeting(name string) string {
	// TODO
	return ""
}

func main() {
	fmt.Println(Greeting("Gopher"))
}
`,
        [
          'Сначала собери строку внутри функции, а не в main.',
          'Функция должна вернуть строку, а fmt.Println просто показать её пользователю.',
          'В учебных задачах сначала лучше сделать решение простым, а не “умным”.',
        ]
      ),
    ],
  },
  {
    id: -2,
    module: 'core',
    title: 'Conditionals',
    slug: 'conditionals',
    conceptCode: 'If',
    summary: 'if, else и switch помогают выразить продуктовую логику без лишней вложенности.',
    explanation:
      'Как только программа начинает принимать решения, появляются ветвления. В Go они намеренно простые: без лишних скобок, зато с акцентом на читаемость.',
    syntax: `if score >= 80 {
	fmt.Println("Отлично")
} else if score >= 60 {
	fmt.Println("Хорошо")
} else {
	fmt.Println("Попробуй ещё")
}`,
    examples: JSON.stringify([
      {
        title: 'Guard clause',
        code: `func access(age int) string {
	if age < 18 {
		return "denied"
	}
	return "allowed"
}`,
        description: 'Ранний возврат делает код легче для ревью.',
      },
    ]),
    patterns: `if <condition> {
	return <value>
}
return <fallback>`,
    order: 2,
    expectedOutput: 'positive',
    microSkills: [
      'разделять сценарии по условиям',
      'использовать ранний return',
      'упрощать вложенность через guard clauses',
    ],
    commonMistakes: [
      'строят длинные лесенки из вложенных if',
      'не покрывают сценарий по умолчанию',
      'смешивают проверку данных и вывод текста в одном месте',
    ],
    relatedSprint: 'Sprint 1 · Number Guessing Game',
    sections: [
      {
        title: 'About Conditionals',
        paragraphs: [
          'Условия — это язык решений внутри программы. Они определяют, какой сценарий должен сработать прямо сейчас.',
          'В большинстве продуктовых задач if отвечает за валидацию, branch-логику и ранний выход из невалидного сценария.',
        ],
      },
      {
        title: 'if and else',
        paragraphs: [
          'В Go условие записывается без круглых скобок. Это экономит визуальный шум и делает код чуть более прямым.',
          'Сначала старайся писать самые частые и самые критичные сценарии так, чтобы они читались первыми.',
        ],
        code: `if input == "" {
	return "empty"
} else {
	return "ok"
}`,
      },
      {
        title: 'Guard clauses',
        paragraphs: [
          'Guard clause — это ранний возврат, который защищает основную логику от плохого ввода.',
          'Чем меньше уровней вложенности, тем легче поддерживать код через месяц и объяснять его на code review.',
        ],
        code: `if age < 18 {
	return "denied"
}

return "allowed"`,
      },
    ],
    practiceRail: [
      rail('Sign Detector', 'Научись быстро делить ввод на positive, negative и zero.', 'recommended'),
      rail('Eligibility Check', 'Закрепи ранние возвраты в логике доступа.', 'learning'),
      rail('Switch Statuses', 'Попрактикуй сценарии с несколькими статусами.', 'locked'),
      rail('Validation Flow', 'Собери цепочку проверок без лишней вложенности.', 'locked'),
    ],
    exercises: [
      exercise(
        -2,
        'Определи знак числа',
        'Реализуй Sign: positive для положительного числа, negative для отрицательного и zero для нуля.',
        'Conditionals',
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
          'Подумай о трёх взаимоисключающих состояниях.',
          'Сначала проверь явные сценарии, потом верни fallback.',
          'Функция должна вернуть одно слово без fmt внутри.',
        ]
      ),
    ],
  },
  {
    id: -3,
    module: 'core',
    title: 'Loops',
    slug: 'loops',
    conceptCode: 'Fo',
    summary: 'for и range дают почти всё, что нужно для прохода по данным, накопления и фильтрации.',
    explanation:
      'В Go только один цикл — for. Это упрощает ментальную модель: ты учишь одну конструкцию и применяешь её для очень разных задач.',
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
        description: 'Классический паттерн “инициализируй → пройди → накопи → верни”.',
      },
    ]),
    patterns: `accumulator := 0
for _, item := range items {
	accumulator += item
}
return accumulator`,
    order: 3,
    expectedOutput: '10',
    microSkills: [
      'читать range как “пройти по всем элементам”',
      'копить результат во внешней переменной',
      'останавливать цикл, когда результат уже найден',
    ],
    commonMistakes: [
      'обнуляют счётчик внутри цикла',
      'забывают возвращать накопленный результат',
      'решают задачу в несколько циклов там, где хватит одного',
    ],
    relatedSprint: 'Sprint 1 · Number Guessing Game',
    sections: [
      {
        title: 'About Loops',
        paragraphs: [
          'Повторение — одна из самых частых операций в программировании. Циклы дают структуру для повторяемых действий.',
          'В Go range особенно полезен для слайсов и map: он отдаёт либо индекс и значение, либо ключ и значение.',
        ],
      },
      {
        title: 'for and range',
        paragraphs: [
          'Обычно тебе не нужен классический индексный цикл. Начинай с range, а к индексам возвращайся только если реально нужно.',
        ],
        code: `for _, word := range words {
	fmt.Println(word)
}`,
      },
      {
        title: 'Accumulation and search',
        paragraphs: [
          'Чаще всего цикл делает одну из трёх вещей: суммирует, ищет или фильтрует.',
          'Если ты понимаешь эти три шаблона, то уже можешь собирать много прикладной логики.',
        ],
        code: `found := false
for _, word := range words {
	if word == "go" {
		found = true
		break
	}
}`,
      },
    ],
    practiceRail: [
      rail('Sum Even Numbers', 'Сложи только подходящие значения из коллекции.', 'recommended'),
      rail('Find First Match', 'Остановись, как только получил нужный ответ.', 'learning'),
      rail('Count Events', 'Посчитай повторяющиеся сценарии через цикл.', 'locked'),
      rail('Filter Values', 'Собери новый набор только из подходящих элементов.', 'locked'),
    ],
    exercises: [
      exercise(
        -3,
        'Сумма чётных чисел',
        'Верни сумму только чётных чисел из слайса.',
        'Loops',
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
          'Тебе нужен счётчик-накопитель и один проход по массиву.',
          'Проверяй чётность перед тем как добавлять число в сумму.',
          'Не подставляй ответ руками — он должен вычислиться кодом.',
        ]
      ),
    ],
  },
  {
    id: -4,
    module: 'core',
    title: 'Collections',
    slug: 'collections',
    conceptCode: 'Co',
    summary: 'Слайсы и map — две главные структуры данных для прикладных задач на старте.',
    explanation:
      'Когда продукт начинает работать с наборами данных, тебе нужны коллекции. Слайсы хороши для упорядоченных списков, map — для быстрых поисков и счётчиков.',
    syntax: `names := []string{"Ana", "Bob"}
names = append(names, "Kim")

counts := make(map[string]int)
counts["go"]++`,
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
        description: 'Map отлично подходит для частот и индексов.',
      },
    ]),
    patterns: `result := make(map[string]int)
for _, item := range items {
	result[item]++
}
return result`,
    order: 4,
    expectedOutput: '2',
    microSkills: [
      'создавать слайсы и дополнять их через append',
      'инициализировать map через make',
      'мысленно выбирать между list и dictionary',
    ],
    commonMistakes: [
      'пишут в nil map и получают runtime panic',
      'не различают список и индекс по ключу',
      'усложняют задачу map-ом там, где хватит простого цикла',
    ],
    relatedSprint: 'Sprint 3 · Expense Tracker',
    sections: [
      {
        title: 'About Collections',
        paragraphs: [
          'Коллекции нужны почти в каждом проекте: список расходов, массив задач, карта конфигураций, индекс пользователей.',
          'На старте важно не просто знать синтаксис, а чувствовать, когда нужен slice, а когда map.',
        ],
      },
      {
        title: 'Slices',
        paragraphs: [
          'Slice — это динамический список. Его удобно наращивать по мере обработки данных.',
        ],
        code: `items := []string{"go", "api"}
items = append(items, "json")`,
      },
      {
        title: 'Maps',
        paragraphs: [
          'Map — это структура “ключ → значение”. Она особенно полезна для счётчиков, lookup-таблиц и быстрого доступа по идентификатору.',
        ],
        code: `scores := make(map[string]int)
scores["ana"] = 10
scores["ana"]++`,
      },
    ],
    practiceRail: [
      rail('Count "go"', 'Собери простой счётчик в списке слов.', 'recommended'),
      rail('Expense Categories', 'Разложи элементы по категориям через map.', 'learning'),
      rail('Positive Filter', 'Собери новый список по условию.', 'locked'),
      rail('Lookup Table', 'Подготовь быстрый доступ по ключу.', 'locked'),
    ],
    exercises: [
      exercise(
        -4,
        'Посчитай слово',
        'Верни, сколько раз слово go встречается в слайсе.',
        'Collections',
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
          'Здесь хватит одного цикла и одного счётчика.',
          'Map не обязателен: это задача на базовую работу со списком.',
          'Проверь, чтобы функция возвращала именно число совпадений.',
        ]
      ),
    ],
  },
  {
    id: -5,
    module: 'core',
    title: 'Structs',
    slug: 'structs',
    conceptCode: 'St',
    summary: 'Struct собирает связанные данные в сущности, а методы делают поведение ближе к этим данным.',
    explanation:
      'Как только в проекте появляются User, Expense или WeatherResponse, разрозненные переменные начинают мешать. Struct помогает описывать реальные сущности предметной области.',
    syntax: `type Expense struct {
	Title  string
	Amount int
}

func (e Expense) Summary() string {
	return e.Title
}`,
    examples: JSON.stringify([
      {
        title: 'Struct как модель',
        code: `type User struct {
	Name  string
	Email string
}`,
        description: 'Struct хорошо отображает один объект из реального мира.',
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
      'группировать связанные поля в один тип',
      'думать сущностями, а не россыпью переменных',
      'выносить понятное поведение в методы',
    ],
    commonMistakes: [
      'создают struct без ясной бизнес-сущности',
      'используют анонимные наборы полей вместо понятных типов',
      'держат логику далеко от данных, где её сложно найти',
    ],
    relatedSprint: 'Sprint 3 · Expense Tracker',
    sections: [
      {
        title: 'About Structs',
        paragraphs: [
          'Struct — это способ назвать и упаковать данные, которые относятся к одной сущности.',
          'Когда у тебя появляется модель Expense или User, код начинает читаться как язык продукта, а не как случайный набор переменных.',
        ],
      },
      {
        title: 'Defining a struct',
        paragraphs: [
          'Поля struct описывают то, что объект “знает о себе”. Старайся не добавлять туда всё подряд — только сущностные данные.',
        ],
        code: `type Expense struct {
	Title  string
	Amount int
}`,
      },
      {
        title: 'Methods',
        paragraphs: [
          'Метод — это поведение, которое естественно связано с конкретной сущностью.',
          'Если функция звучит как “expense умеет ...”, это хороший кандидат на метод.',
        ],
        code: `func (e Expense) Summary() string {
	return e.Title
}`,
      },
    ],
    practiceRail: [
      rail('Expense Summary', 'Опиши модель расхода и выведи её как строку.', 'recommended'),
      rail('User Display Name', 'Собери читаемое представление объекта через метод.', 'learning'),
      rail('Weather Response', 'Подготовь struct под ответ внешнего API.', 'locked'),
      rail('Task Model', 'Опиши прикладную сущность для CLI-инструмента.', 'locked'),
    ],
    exercises: [
      exercise(
        -5,
        'Карточка расхода',
        'Создай struct Expense с полями Title и Amount, а затем метод Summary() string, который вернёт "Coffee: 350".',
        'Structs',
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
          'Сначала опиши поля сущности, а потом поведение.',
          'Метод должен собирать строку из Title и Amount.',
          'Здесь полезно думать так: “как объект Expense покажет себя пользователю?”',
        ]
      ),
    ],
  },
  {
    id: -6,
    module: 'core',
    title: 'Errors',
    slug: 'errors',
    conceptCode: 'Er',
    summary: 'Ошибки в Go обрабатываются явно: проверить, вернуть, не прятать проблему под ковёр.',
    explanation:
      'В реальном backend данные редко идеальны. Ошибки — это не исключение, а часть нормального control flow. Поэтому в Go они остаются видимыми и честными.',
    syntax: `value, err := strconv.Atoi(input)
if err != nil {
	return 0, err
}`,
    examples: JSON.stringify([
      {
        title: 'Простая валидация',
        code: `func ValidateName(name string) error {
	if name == "" {
		return errors.New("name is required")
	}
	return nil
}`,
        description: 'Guard clause защищает основную логику от невалидного ввода.',
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
      'замечать err сразу после операции',
      'писать короткие защитные проверки',
      'возвращать осмысленные сообщения об ошибках',
    ],
    commonMistakes: [
      'игнорируют err и двигаются дальше',
      'возвращают пустой результат без объяснения причины',
      'запутывают ошибку лишней логикой в одном блоке',
    ],
    relatedSprint: 'Sprint 2 · Weather API Wrapper Service',
    sections: [
      {
        title: 'About Errors',
        paragraphs: [
          'Ошибки в Go — часть обычной логики. Если что-то может сломаться, это видно прямо в коде.',
          'Такой подход сначала кажется многословным, зато отлично работает в проде и на ревью.',
        ],
      },
      {
        title: 'Checking err',
        paragraphs: [
          'Паттерн if err != nil повторяется в Go постоянно. Это не шум, а защита от плохих данных и нестабильных внешних систем.',
        ],
        code: `value, err := strconv.Atoi(input)
if err != nil {
	return 0, err
}`,
      },
      {
        title: 'Validation first',
        paragraphs: [
          'Многие ошибки можно поймать ещё до основной логики: пустая строка, некорректный id, отсутствующее значение.',
        ],
        code: `if name == "" {
	return errors.New("name is required")
}`,
      },
    ],
    practiceRail: [
      rail('Name Validation', 'Сделай явную проверку пользовательского ввода.', 'recommended'),
      rail('Parse Input', 'Верни ошибку наверх, а не скрывай её.', 'learning'),
      rail('API Failure', 'Подумай, как обработать поломку внешнего сервиса.', 'locked'),
      rail('File Read Guard', 'Собери безопасный сценарий вокруг чтения данных.', 'locked'),
    ],
    exercises: [
      exercise(
        -6,
        'Проверь пустое имя',
        'Если name пустой, верни ошибку "name is required". Иначе верни nil.',
        'Errors',
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
          'Тут не нужен сложный flow: одна проверка и один return.',
          'Ошибку удобно создавать через errors.New.',
          'Если всё валидно, функция должна вернуть nil.',
        ]
      ),
    ],
  },
  {
    id: -7,
    module: 'core',
    title: 'HTTP & JSON',
    slug: 'json-http',
    conceptCode: 'AP',
    summary: 'Здесь Go начинает разговаривать с внешним миром: контракты API, JSON-модели и endpoint-логика.',
    explanation:
      'После CLI-проектов следующий большой шаг — интеграции. Ты описываешь JSON, думаешь контрактами и начинаешь строить backend не в вакууме, а рядом с другими сервисами.',
    syntax: `type WeatherResponse struct {
	City string \`json:"city"\`
	Temp int    \`json:"temp"\`
}

func weatherPath(city string) string {
	return "/weather?city=" + city
}`,
    examples: JSON.stringify([
      {
        title: 'Struct под JSON',
        code: `type UserResponse struct {
	ID    int    \`json:"id"\`
	Email string \`json:"email"\`
}`,
        description: 'JSON-теги связывают поля Go со схемой ответа API.',
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
      'использовать теги json:"field"',
      'собирать простой API-path без путаницы',
    ],
    commonMistakes: [
      'не совпадают json-теги и реальные поля ответа',
      'пытаются строить весь сервис, не поняв контракт',
      'мешают транспортный слой и бизнес-логику в одном месте',
    ],
    relatedSprint: 'Sprint 2 · Weather API Wrapper Service',
    sections: [
      {
        title: 'About HTTP & JSON',
        paragraphs: [
          'Большая часть backend-разработки — это работа с контрактами: что приходит, что уходит и как это описано.',
          'JSON — просто формат данных, но именно через него ты начинаешь чувствовать себя частью реального сервиса.',
        ],
      },
      {
        title: 'JSON structs',
        paragraphs: [
          'Когда ответ API приходит в JSON, удобнее всего описать его через struct с json-тегами.',
        ],
        code: `type WeatherResponse struct {
	City string \`json:"city"\`
	Temp int    \`json:"temp"\`
}`,
      },
      {
        title: 'Endpoints and contracts',
        paragraphs: [
          'Прежде чем писать сложный клиент, полезно научиться собирать endpoint и формулировать контракт ответа.',
          'Если контракт понятен, весь остальной код становится гораздо проще.',
        ],
        code: `func weatherPath(city string) string {
	return "/weather?city=" + city
}`,
      },
    ],
    practiceRail: [
      rail('Weather Path', 'Собери путь до погодного endpoint.', 'recommended'),
      rail('JSON Response Model', 'Опиши struct под внешний ответ.', 'learning'),
      rail('API Error Handling', 'Подумай, что делать, если внешний сервис не отвечает.', 'locked'),
      rail('Request Parameters', 'Подготовь основу для query-параметров и контрактов.', 'locked'),
    ],
    exercises: [
      exercise(
        -7,
        'Собери endpoint погоды',
        'Реализуй функцию WeatherPath(city string) string, которая вернёт путь /weather?city=<город>.',
        'HTTP & JSON',
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
          'Пока не нужен реальный http.Client — только корректная строка endpoint.',
          'Следи за точным форматом query-параметра.',
          'В таких задачах важна аккуратность контракта, а не сложность кода.',
        ]
      ),
    ],
  },
]

const conceptKeywordMap: Record<string, string[]> = {
  basics: ['онбординг', 'первый день', 'первый', 'основы', 'cli', 'функц', 'пакет'],
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
