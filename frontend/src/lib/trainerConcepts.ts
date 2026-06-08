import type { Exercise, TrainerTopic } from './api'

export type BuiltInTrainerConcept = TrainerTopic & {
  summary: string
  expectedOutput: string
}

function exercise(
  id: number,
  title: string,
  description: string,
  category: string,
  starterCode: string
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
    hints: '[]',
    order: Math.abs(id),
  }
}

export const builtInTrainerConcepts: BuiltInTrainerConcept[] = [
  {
    id: -1,
    module: 'core',
    title: 'Основы Go',
    slug: 'basics',
    summary: 'Packages, переменные, константы и функции.',
    explanation:
      'Любая Go-программа состоит из пакетов. Данные хранятся в переменных и константах, а повторяемое поведение оформляется в функции.',
    syntax: `package main

import "fmt"

const language = "Go"

func greeting(name string) string {
	return "Привет, " + name
}

func main() {
	user := "Gopher"
	fmt.Println(greeting(user), language)
}`,
    examples: JSON.stringify([
      {
        title: 'Короткое объявление переменной',
        code: `name := "Gopher"
age := 3
fmt.Println(name, age)`,
        description: 'Оператор := создаёт переменную и выводит её тип из значения.',
      },
      {
        title: 'Функция с результатом',
        code: `func double(value int) int {
	return value * 2
}`,
        description: 'Тип после параметров показывает, какое значение возвращает функция.',
      },
    ]),
    patterns: `func action(input Type) ResultType {
	result := transform(input)
	return result
}`,
    order: 1,
    expectedOutput: 'Привет, Gopher!',
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
`
      ),
    ],
  },
  {
    id: -2,
    module: 'core',
    title: 'Условия',
    slug: 'conditionals',
    summary: 'if, switch и понятные ветвления.',
    explanation:
      'Условия позволяют программе выбирать действие. В Go условие пишется без круглых скобок, а фигурные скобки обязательны.',
    syntax: `if score >= 80 {
	fmt.Println("Отлично")
} else if score >= 60 {
	fmt.Println("Хорошо")
} else {
	fmt.Println("Попробуй ещё")
}`,
    examples: JSON.stringify([
      {
        title: 'Ранний возврат',
        code: `func access(age int) string {
	if age < 18 {
		return "denied"
	}
	return "allowed"
}`,
        description: 'Guard clause убирает лишнюю вложенность.',
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
`
      ),
    ],
  },
  {
    id: -3,
    module: 'core',
    title: 'Циклы и range',
    slug: 'loops',
    summary: 'Повторение действий и обход коллекций.',
    explanation:
      'В Go есть один цикл — for. Конструкция range помогает последовательно получить индекс и значение из слайса, строки или map.',
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
    ]),
    patterns: `result := initialValue
for _, item := range collection {
	result = update(result, item)
}
return result`,
    order: 3,
    expectedOutput: '10',
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
`
      ),
    ],
  },
  {
    id: -4,
    module: 'core',
    title: 'Слайсы и map',
    slug: 'collections',
    summary: 'Коллекции, добавление и быстрый поиск.',
    explanation:
      'Слайс хранит упорядоченный набор значений, а map связывает ключ со значением. Вместе они покрывают большинство задач обработки данных.',
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
        description: 'Нулевое значение int позволяет сразу увеличивать счётчик.',
      },
    ]),
    patterns: `result := make(map[Key]Value)
for _, item := range items {
	result[key(item)] = value(item)
}
return result`,
    order: 4,
    expectedOutput: '2',
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
`
      ),
    ],
  },
]

export function getBuiltInTrainerConcept(slug: string): BuiltInTrainerConcept | undefined {
  return builtInTrainerConcepts.find((concept) => concept.slug === slug)
}

export function isBuiltInExercise(exerciseId: number): boolean {
  return exerciseId < 0
}
