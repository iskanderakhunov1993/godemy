package data

import (
	"fmt"

	"golanger/backend/models"

	"gorm.io/gorm"
)

func Seed(db *gorm.DB) {
	coreLessons := []models.Lesson{
		{
			Module: "core", Slug: "onboarding-welcome", Title: "Добро пожаловать!", Description: "О курсе, структуре обучения и что тебя ждёт", Category: "Онбординг", Order: 1,
			Content: `# Добро пожаловать!

![Gopher](https://go.dev/blog/gopher/gopher.png)

Привет! Добро пожаловать в **Go Academy** — интерактивный курс по языку Go.

Здесь не будет скучных видеолекций и оторванной от жизни теории. Только рабочий код, реальные задачи и порядок, в котором профессиональные Go-разработчики действительно учатся.

> Изображение Go Gopher создано [Renee French](https://reneefrench.blogspot.com/) и распространяется по лицензии CC BY 3.0.

---

## Что тебя ждёт на платформе

Платформа состоит из трёх разделов. Каждый — с чёткой целью.

---

### 📚 Курс — твоя дорожная карта

Весь путь **от синтаксиса до боевого проекта** разбит на 11 модулей. Модули открываются по мере прохождения — так знания укладываются последовательно, без провалов.

Внутри каждого модуля: уроки с теорией, примеры кода, и ссылки на практику.

👉 [Открыть Курс →](/guide)

---

### ⚡ Тренажёр — пиши код прямо в браузере

Теория без практики — ничто. В тренажёре собраны **десятки задач** с автоматической проверкой: пишешь решение, нажимаешь «Запустить» — и сразу видишь результат.

Задачи сгруппированы по темам: от простых переменных до горутин и JSON.

👉 [Открыть Тренажёр →](/trainer)

---

### 🚀 Буткемп — спринт к первой работе

Если хочешь попасть на Junior-позицию **как можно быстрее** — это твой маршрут. Буткемп — это сжатая программа из 6 спринтов с упором на то, что реально спрашивают на собеседованиях.

В конце — резюме, портфолио и навыки, которые ждут работодатели.

👉 [Открыть Буткемп →](/bootcamp)

---

## С чего начать?

Если ты здесь впервые — иди по порядку: онбординг → курс → тренажёр. Если уже знаешь Go и хочешь быстро к работе — сразу в Буткемп.

**Давай, го! 🐹**
`,
		},

		{
			Module: "core", Slug: "onboarding-for-whom", Title: "Для кого этот курс", Description: "Целевая аудитория, предварительные знания и кому подойдёт Go", Category: "Онбординг", Order: 2,
			Content: `# Для кого этот курс?

![Mark Zuckerberg](https://upload.wikimedia.org/wikipedia/commons/e/ef/MarkZuckerberg.jpg)

*Марк Цукерберг в 2005 году — в 21 год написал Facebook. Он тоже когда-то начинал с первой строчки кода.*

---

Этот курс подойдёт тебе, если ты узнаёшь себя хотя бы в одном из пунктов:

---

👶 **Новичок в программировании**
Хочешь войти в IT и ищешь понятную, современную и востребованную технологию для старта.

🔄 **Разработчик на другом языке**
Уже пишешь на Python, JavaScript, Java или другом языке и хочешь освоить Go для backend-разработки, микросервисов или высоконагруженных систем.

🧩 **Самоучка без структуры**
Учился по видео и статьям, но чувствуешь, что не хватает системы и практики. Наш roadmap поможет выстроить чёткий путь.

🚀 **Тот, кто хочет больше практики**
Устал от курсов с бесконечной теорией и хочешь реально писать код, а не просто смотреть уроки.

💼 **Начинающий разработчик**
Хочешь усилить резюме, собрать портфолио и подготовиться к собеседованиям через реальные задачи и проекты.

🧠 **Любитель челленджей**
Готов к буткемпу, дедлайнам и интенсивному обучению, где результат зависит от твоего вовлечения.

---

Если коротко — курс для тех, кто хочет не просто «изучить Go», а **научиться программировать и применять это на практике**.
`,
		},
		{
			Module: "core", Slug: "onboarding-go-devs", Title: "Кто такие Go-разработчики?", Description: "Фронтенд, бэкенд, рынок труда и почему Go перспективен", Category: "Онбординг", Order: 3,
			Content: `# Кто такой Go-разработчик и как устроена разработка?

Представь, что ты открываешь приложение — заказываешь еду, покупаешь товар или оплачиваешь что-то онлайн. Всё работает быстро, ничего не зависает, данные сохраняются.

За это отвечает **бэкенд**, и именно здесь работает **Go-разработчик**.

Он пишет «внутреннюю логику» системы:
— принимает запросы от пользователей
— обрабатывает данные
— работает с базами
— следит, чтобы сервис выдерживал нагрузку и не падал

Go часто используют там, где важны скорость, стабильность и масштаб.

---

## Как устроен IT-проект?

Давай на простом примере — сервис доставки еды.

Над ним работает команда:

| Роль | Задача |
|------|--------|
| 🎨 Дизайнер | Делает интерфейс удобным и понятным |
| 🧠 Аналитик / архитектор | Продумывает, как всё будет работать |
| 💻 Фронтендер | Делает то, что видит пользователь |
| ⚙️ Бэкендер (Go-разработчик) | Пишет «мозг» системы |
| 🔍 Тестировщик | Проверяет, чтобы ничего не ломалось |

И вот ты, как Go-разработчик, делаешь так, чтобы:

> пользователь нажал кнопку → заказ ушёл → оплата прошла → данные сохранились

---

## Небольшая история

Представь: тебе дают задачу — «Сделать сервис заказов, который выдерживает тысячи пользователей одновременно».

Ты пишешь API на Go: настраиваешь обработку запросов, подключаешь базу, используешь **goroutines**, чтобы всё работало параллельно и быстро.

Фронтендер подключает интерфейс. Тестировщик проверяет.

И в итоге получается настоящий продукт, которым пользуются люди.

---

## Что написано на Go?

Go используют не в «учебных проектах», а в реальных, больших системах:

| Компания | Что используют |
|----------|---------------|
| 🔵 **Google** | Создали Go и используют внутри своих сервисов |
| 🐳 **Docker** | Инструмент, на котором держится современная разработка |
| ☸️ **Kubernetes** | Стандарт для управления инфраструктурой |
| 🛒 **Wildberries / Ozon** | Огромные e-commerce платформы |
| 🔍 **Яндекс / VK** | Высоконагруженные сервисы |

Это означает:

— 📈 много вакансий
— 💰 хорошие зарплаты
— 🛠 современный стек (Go + Docker + Kubernetes)
— 🚀 работа с реальными высоконагруженными системами

**Ты учишь не просто язык — ты заходишь в экосистему, которая используется в индустрии прямо сейчас.**

---

## Что дальше после курса?

Курс даст тебе сильную базу и много практики. Но если хочешь выйти на уровень работы — следующий шаг это **буткемп**.

В буткемпе ты:
— решаешь более сложные задачи
— работаешь в формате, похожем на реальную команду
— делаешь полноценные проекты
— прокачиваешь скорость и уверенность

После буткемпа у тебя уже есть:
— опыт
— портфолио
— понимание реальной разработки

И на этом этапе можно начинать искать работу 💼

---

> Курс — это фундамент, буткемп — это переход в реальную разработку.
`,
		},
		{
			Module: "core", Slug: "introduction", Title: "Введение в Go", Description: "Что такое Go, где используется и как устроена экосистема", Category: "Основы", Order: 11,
			Content: `# Введение в Go

Go (или Golang) — компилируемый статически типизированный язык, созданный в Google в 2007 году.

## Почему Go?

- **Простота**: небольшая спецификация языка, легко читается чужой код
- **Скорость**: компилируется в нативный бинарник, работает быстро
- **Конкурентность**: goroutines и channels встроены в язык
- **Единый бинарник**: не нужен runtime или интерпретатор при деплое

## Где используется

- Backend API и микросервисы (Kubernetes, Docker, Terraform написаны на Go)
- CLI-инструменты
- Высоконагруженные сервисы

## Первая программа

` + "```go" + `
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
` + "```" + `

Каждая программа на Go начинается с пакета ` + "`main`" + ` и функции ` + "`main()`" + `.

## Установка и запуск

` + "```bash" + `
# Установка: https://go.dev/dl/
go run main.go   # запустить
go build         # скомпилировать
go test ./...    # запустить тесты
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "variables-and-types", Title: "Переменные и типы данных", Description: "var, :=, string, int, bool, нулевые значения и константы", Category: "Основы", Order: 12,
			Content: `# Переменные и типы данных

## Объявление переменных

` + "```go" + `
// Полная форма
var name string = "Alice"
var age int = 30

// Краткая форма (только внутри функции)
name := "Alice"
age := 30

// Несколько переменных
var x, y int = 1, 2
a, b := "hello", true
` + "```" + `

## Базовые типы

| Тип | Описание | Нулевое значение |
|-----|----------|-----------------|
| ` + "`int`" + ` | целое число | ` + "`0`" + ` |
| ` + "`float64`" + ` | число с плавающей точкой | ` + "`0.0`" + ` |
| ` + "`string`" + ` | строка (UTF-8) | ` + `""` + ` |
| ` + "`bool`" + ` | булев тип | ` + "`false`" + ` |
| ` + "`byte`" + ` | псевдоним для uint8 | ` + "`0`" + ` |

## Константы

` + "```go" + `
const Pi = 3.14159
const MaxRetries = 3
const AppName = "golanger"

// Перечисление через iota
const (
    StatusPending = iota  // 0
    StatusActive          // 1
    StatusDone            // 2
)
` + "```" + `

## Важно: нулевые значения

В Go переменная всегда инициализирована. Нет понятия "undefined".

` + "```go" + `
var count int    // count == 0
var label string // label == ""
var ok bool      // ok == false
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "functions", Title: "Функции", Description: "Объявление, параметры, multiple return values, именованные возвраты, ошибки", Category: "Основы", Order: 13,
			Content: `# Функции

## Базовое объявление

` + "```go" + `
func greet(name string) string {
    return "Hello, " + name
}

func add(a, b int) int {
    return a + b
}
` + "```" + `

## Multiple return values

Go поддерживает несколько возвращаемых значений. Главным образом это используется для возврата результата и ошибки.

` + "```go" + `
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 3)
if err != nil {
    log.Fatal(err)
}
fmt.Println(result) // 3.3333...
` + "```" + `

## Variadic функции

` + "```go" + `
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

sum(1, 2, 3)       // 6
sum([]int{1,2,3}...) // то же самое через слайс
` + "```" + `

## Функции как значения

` + "```go" + `
func apply(f func(int) int, x int) int {
    return f(x)
}

double := func(x int) int { return x * 2 }
apply(double, 5) // 10
` + "```" + `

## Defer

` + "`defer`" + ` откладывает вызов до выхода из функции. Полезно для закрытия ресурсов.

` + "```go" + `
func readFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close() // выполнится при выходе из readFile

    // работаем с f...
    return nil
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "control-flow", Title: "Управляющие конструкции", Description: "if/else, for, range, switch, break, continue", Category: "Основы", Order: 14,
			Content: `# Управляющие конструкции

## if / else

` + "```go" + `
x := 10
if x > 5 {
    fmt.Println("big")
} else if x == 5 {
    fmt.Println("five")
} else {
    fmt.Println("small")
}

// if с инициализацией (часто используется с error)
if err := doSomething(); err != nil {
    log.Fatal(err)
}
` + "```" + `

## for — единственный цикл в Go

` + "```go" + `
// Классический
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// Как while
n := 1
for n < 100 {
    n *= 2
}

// Бесконечный
for {
    // break для выхода
}
` + "```" + `

## range

` + "```go" + `
nums := []int{2, 4, 6}
for i, v := range nums {
    fmt.Printf("index=%d, value=%d\n", i, v)
}

m := map[string]int{"a": 1, "b": 2}
for k, v := range m {
    fmt.Printf("%s=%d\n", k, v)
}
` + "```" + `

## switch

` + "```go" + `
day := "Monday"
switch day {
case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday":
    fmt.Println("Weekday")
case "Saturday", "Sunday":
    fmt.Println("Weekend")
default:
    fmt.Println("Unknown")
}

// switch без выражения — как if/else chain
switch {
case x < 0:
    fmt.Println("negative")
case x == 0:
    fmt.Println("zero")
default:
    fmt.Println("positive")
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "arrays-slices", Title: "Массивы и слайсы", Description: "array, slice, append, copy, len, cap", Category: "Коллекции", Order: 15,
			Content: `# Массивы и слайсы

## Массивы

Фиксированный размер, редко используются напрямую.

` + "```go" + `
var a [3]int        // [0, 0, 0]
b := [3]int{1,2,3}  // [1, 2, 3]
c := [...]int{4,5,6} // компилятор считает размер
` + "```" + `

## Слайсы

Слайс — динамический "вид" на массив. Основная структура данных в Go.

` + "```go" + `
s := []int{1, 2, 3}
s = append(s, 4, 5)
fmt.Println(len(s), cap(s)) // 5, 6

// Создание через make
s2 := make([]int, 5)      // len=5, cap=5, всё 0
s3 := make([]int, 0, 10)  // len=0, cap=10

// Срез (slice expression)
s4 := s[1:3] // [2, 3] — разделяет память с s!
` + "```" + `

## Копирование

` + "```go" + `
src := []int{1, 2, 3}
dst := make([]int, len(src))
copy(dst, src) // глубокая копия
` + "```" + `

## Итерация

` + "```go" + `
fruits := []string{"apple", "banana", "cherry"}
for i, fruit := range fruits {
    fmt.Printf("%d: %s\n", i, fruit)
}
` + "```" + `

## Двумерный слайс

` + "```go" + `
matrix := [][]int{
    {1, 2, 3},
    {4, 5, 6},
}
fmt.Println(matrix[1][2]) // 6
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "maps", Title: "Maps (словари)", Description: "Создание, чтение, запись, удаление, проверка наличия ключа", Category: "Коллекции", Order: 16,
			Content: `# Maps

Map — хэш-таблица «ключ → значение».

## Создание

` + "```go" + `
// Литерал
m := map[string]int{
    "alice": 30,
    "bob":   25,
}

// Через make
m2 := make(map[string]int)
` + "```" + `

## Операции

` + "```go" + `
// Запись
m["charlie"] = 28

// Чтение
age := m["alice"] // 30

// Проверка наличия ключа
age, ok := m["dave"]
if !ok {
    fmt.Println("dave not found")
}

// Удаление
delete(m, "bob")

// Размер
fmt.Println(len(m))
` + "```" + `

## Итерация (порядок не гарантирован)

` + "```go" + `
for name, age := range m {
    fmt.Printf("%s is %d\n", name, age)
}
` + "```" + `

## Частые ошибки

` + "```go" + `
// ОШИБКА: запись в nil map — panic!
var bad map[string]int
bad["key"] = 1 // panic

// ПРАВИЛЬНО
good := make(map[string]int)
good["key"] = 1
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "structs", Title: "Структуры и методы", Description: "struct, methods, value vs pointer receiver, embedding", Category: "ООП в Go", Order: 17,
			Content: `# Структуры и методы

## Структуры

` + "```go" + `
type User struct {
    ID       int
    Name     string
    Email    string
    IsAdmin  bool
}

// Создание
u := User{ID: 1, Name: "Alice", Email: "alice@example.com"}
u2 := User{Name: "Bob"} // остальные поля — нулевые значения
` + "```" + `

## Методы

Метод — функция, привязанная к типу.

` + "```go" + `
// Value receiver — не изменяет оригинал
func (u User) Greet() string {
    return "Hello, " + u.Name
}

// Pointer receiver — изменяет оригинал
func (u *User) Promote() {
    u.IsAdmin = true
}

u := User{Name: "Alice"}
fmt.Println(u.Greet())  // Hello, Alice
u.Promote()
fmt.Println(u.IsAdmin)  // true
` + "```" + `

## Правило выбора receiver

- Нужно изменять состояние → pointer receiver ` + "`*T`" + `
- Структура большая → pointer receiver (избегаем копирование)
- Иначе → value receiver достаточно

## Embedding (встраивание)

` + "```go" + `
type Address struct {
    City    string
    Country string
}

type Employee struct {
    User
    Address
    Department string
}

e := Employee{
    User:       User{Name: "Bob"},
    Address:    Address{City: "Moscow"},
    Department: "Engineering",
}
fmt.Println(e.Name) // Bob (через встроенный User)
fmt.Println(e.City) // Moscow (через встроенный Address)
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "interfaces", Title: "Интерфейсы", Description: "interface, duck typing, пустой интерфейс, type assertion", Category: "ООП в Go", Order: 18,
			Content: `# Интерфейсы

## Объявление и реализация

Интерфейс реализуется неявно — не нужно писать ` + "`implements`" + `.

` + "```go" + `
type Animal interface {
    Sound() string
    Move() string
}

type Dog struct{ Name string }
type Bird struct{ Name string }

func (d Dog) Sound() string { return "Woof" }
func (d Dog) Move() string  { return "runs" }

func (b Bird) Sound() string { return "Tweet" }
func (b Bird) Move() string  { return "flies" }

func Describe(a Animal) {
    fmt.Printf("It %s and says %s\n", a.Move(), a.Sound())
}

Describe(Dog{Name: "Rex"})  // It runs and says Woof
Describe(Bird{Name: "Tweety"}) // It flies and says Tweet
` + "```" + `

## Пустой интерфейс

` + "```go" + `
// any = interface{} — принимает любой тип
func Print(v any) {
    fmt.Println(v)
}
` + "```" + `

## Type assertion

` + "```go" + `
var v any = "hello"

s, ok := v.(string)
if ok {
    fmt.Println("string:", s)
}
` + "```" + `

## Type switch

` + "```go" + `
func describe(i any) {
    switch v := i.(type) {
    case int:
        fmt.Printf("int: %d\n", v)
    case string:
        fmt.Printf("string: %q\n", v)
    default:
        fmt.Printf("unknown: %T\n", v)
    }
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "error-handling", Title: "Обработка ошибок", Description: "error interface, errors.New, fmt.Errorf, errors.Is, errors.As, custom errors", Category: "Надёжность", Order: 19,
			Content: `# Обработка ошибок

В Go ошибки — это обычные значения типа ` + "`error`" + `.

## Базовый паттерн

` + "```go" + `
result, err := someFunction()
if err != nil {
    return fmt.Errorf("someFunction failed: %w", err)
}
` + "```" + `

## Создание ошибок

` + "```go" + `
import "errors"

var ErrNotFound = errors.New("not found")
var ErrUnauthorized = errors.New("unauthorized")

// С контекстом
return fmt.Errorf("user %d: %w", id, ErrNotFound)
` + "```" + `

## Кастомные ошибки

` + "```go" + `
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error: %s - %s", e.Field, e.Message)
}
` + "```" + `

## errors.Is и errors.As

` + "```go" + `
// errors.Is — проверяет по значению (с учётом wrapping)
if errors.Is(err, ErrNotFound) {
    // обработка "не найдено"
}

// errors.As — извлекает конкретный тип ошибки
var ve *ValidationError
if errors.As(err, &ve) {
    fmt.Println("Invalid field:", ve.Field)
}
` + "```" + `

## Паника и recover (редко используется)

` + "```go" + `
func safe() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("recovered:", r)
        }
    }()
    panic("something went wrong")
}
` + "```" + `

Используй ` + "`panic`" + ` только для программных ошибок, не для обычного flow.
`,
		},
		{
			Module: "core", Slug: "goroutines-channels", Title: "Goroutines и каналы", Description: "go keyword, chan, select, sync.WaitGroup, sync.Mutex", Category: "Конкурентность", Order: 20,
			Content: `# Goroutines и каналы

## Goroutine

Лёгкий поток выполнения. Запускается через ` + "`go`" + `.

` + "```go" + `
func worker(id int) {
    fmt.Printf("Worker %d started\n", id)
    time.Sleep(time.Second)
    fmt.Printf("Worker %d done\n", id)
}

go worker(1)
go worker(2)
// main не ждёт — нужен sync
` + "```" + `

## WaitGroup

` + "```go" + `
var wg sync.WaitGroup

for i := 1; i <= 5; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        worker(id)
    }(i)
}

wg.Wait() // ждём завершения всех
` + "```" + `

## Каналы

` + "```go" + `
ch := make(chan int)       // небуфферизованный
bch := make(chan int, 10)  // буффер на 10

// Отправка
ch <- 42

// Получение
v := <-ch
v, ok := <-ch // ok=false если канал закрыт и пуст
` + "```" + `

## select

` + "```go" + `
select {
case msg := <-ch1:
    fmt.Println("from ch1:", msg)
case msg := <-ch2:
    fmt.Println("from ch2:", msg)
case <-time.After(time.Second):
    fmt.Println("timeout")
}
` + "```" + `

## Mutex

` + "```go" + `
var mu sync.Mutex
counter := 0

mu.Lock()
counter++
mu.Unlock()

// или через defer
func increment() {
    mu.Lock()
    defer mu.Unlock()
    counter++
}
` + "```" + `
`,
		},
	}

	coreLessons = append(coreLessons, extraCoreLessons()...)

	lessons := append(coreLessons, juniorLessons()...)
	for i := range lessons {
		if lessons[i].Module == "" {
			lessons[i].Module = "core"
		}
		if lessons[i].Module == "junior" {
			lessons[i].Module = "bootcamp"
		}
		var existing models.Lesson
		db.Where("slug = ?", lessons[i].Slug).Attrs(lessons[i]).FirstOrCreate(&existing)
	}

	SeedCourseStructure(db)
	SeedModule1Content(db)
	SeedModule6to7Content(db)

	exercises := generatedPracticeExercises("core", 1, 50)
	exercises = append(exercises, juniorSprintExercises()...)

	for i := range exercises {
		if exercises[i].Module == "" {
			exercises[i].Module = "core"
		}
		if exercises[i].Module == "junior" {
			exercises[i].Module = "bootcamp"
		}
		var existing models.Exercise
		db.Where("module = ? AND \"order\" = ?", exercises[i].Module, exercises[i].Order).Attrs(exercises[i]).FirstOrCreate(&existing)
	}

	seedFlagshipCourse(db)
}

func juniorLessons() []models.Lesson {
	return []models.Lesson{
		{
			Module:      "junior",
			Slug:        "junior-sprint1-brief",
			Title:       "Sprint 1.1: Бриф и задача спринта",
			Description: "Старт проекта Todo API: контекст, цель и требования",
			Category:    "Sprint 1",
			Order:       1,
			Content: `# Sprint 1.1: Бриф и задача спринта

Ты junior Go-разработчик. Первая задача — собрать минимальный Todo API.

## Что нужно сделать

- поднять HTTP-сервер
- добавить health-check endpoint
- подготовить основу для списка задач

## Итог Sprint 1

Ты должен уверенно понимать путь запроса: route -> handler -> response.
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint1-server-router-theory",
			Title:       "Sprint 1.2: Сервер и роутер",
			Description: "Короткая теория по запуску сервера и маршрутизации",
			Category:    "Sprint 1",
			Order:       2,
			Content: `# Sprint 1.2: Сервер и роутер

- main() как точка входа
- server слушает порт
- роутер выбирает handler

Минимальный каркас:

` + "```go" + `
func main() {
    http.HandleFunc("/health", health)
    http.ListenAndServe(":8080", nil)
}
` + "```" + `
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint1-request-response-theory",
			Title:       "Sprint 1.3: Request, Response и JSON",
			Description: "Короткая теория про request/response модель и JSON",
			Category:    "Sprint 1",
			Order:       3,
			Content: `# Sprint 1.3: Request, Response и JSON

- request: входные данные
- response: результат обработки
- status code: краткий итог запроса

Базовые коды:
- 200 OK
- 201 Created
- 400 Bad Request
- 500 Internal Server Error
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint1-examples-basic-handlers",
			Title:       "Sprint 1.4: Примеры 1-2",
			Description: "Первые примеры: старт сервера и health handler",
			Category:    "Sprint 1",
			Order:       4,
			Content: `# Sprint 1.4: Примеры 1-2

Пример 1 — запуск сервера.
Пример 2 — health-check handler.

Фокус: простые, маленькие и предсказуемые handlers.
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint1-examples-json-post",
			Title:       "Sprint 1.5: Примеры 3-5",
			Description: "JSON-ответ, чтение body и 201 Created",
			Category:    "Sprint 1",
			Order:       5,
			Content: `# Sprint 1.5: Примеры 3-5

- JSON список задач
- чтение JSON body
- корректный ответ 201 Created для create endpoint
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint1-practice",
			Title:       "Sprint 1.6: Практика и закрепление",
			Description: "2 практические задачи по Sprint 1",
			Category:    "Sprint 1",
			Order:       6,
			Content: `# Sprint 1.6: Практика и закрепление

## Задача 1
Добавь endpoint GET /api/version с JSON-ответом.

## Задача 2
Добавь в задачи поле createdAt.

## Definition of Done

- сервер стабильно стартует
- health-check работает
- GET/POST задачи возвращают корректный JSON
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint1-interview-questions",
			Title:       "Sprint 1.7: Вопросы с собеседований",
			Description: "Топ вопросов по HTTP базам, handlers и JSON",
			Category:    "Sprint 1",
			Order:       7,
			Content: `# Sprint 1.7: Вопросы с собеседований

Используй интервальное повторение: 15 минут -> конец дня -> 1, 3 и 7 день.

На что смотреть в первую очередь:
- handler
- route -> handler
- GET vs POST
- status code
- JSON контракт
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint0-it-and-agile",
			Title:       "Sprint 0.1: Как устроено IT и что такое Agile",
			Description: "Коротко про устройство IT-команд и почему Agile используют в реальной разработке",
			Category:    "Sprint 0",
			Order:       8,
			Content: `# Sprint 0.1: Как устроено IT и что такое Agile

Перед проектами важно понять контекст, в котором работает разработчик.

## Как устроено IT

- продукт решает бизнес-задачу пользователя
- над продуктом работает кросс-функциональная команда
- ключевые циклы: гипотеза -> разработка -> релиз -> обратная связь

## Что такое Agile

Agile — это подход, где работа идет короткими итерациями (спринтами), с регулярной проверкой результата.

### Почему это работает

- быстро виден прогресс
- проще менять приоритеты
- меньше риска делать "не то"
- команда учится на каждом цикле

## Что важно для junior

Твоя задача — поставлять маленькие, но завершенные куски ценности в каждом спринте.
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint0-roles-and-our-role",
			Title:       "Sprint 0.2: Роли в команде и наша роль",
			Description: "Какие роли есть в продуктовой разработке и за что отвечает Go backend разработчик",
			Category:    "Sprint 0",
			Order:       9,
			Content: `# Sprint 0.2: Роли в команде и наша роль

## Типичные роли в продукте

- Product Manager — формирует ценность и приоритеты
- Designer — проектирует UX/UI
- Frontend Developer — клиентская часть
- Backend Developer — API, данные, интеграции
- QA Engineer — качество и тестирование
- DevOps/SRE — окружения, стабильность, деплой

## Наша роль

Мы берем роль Go backend разработчика.

### Что мы делаем

- проектируем и пишем API
- работаем с данными и бизнес-логикой
- обеспечиваем надежность, валидацию и безопасность
- поддерживаем производительность и наблюдаемость

## Как выглядит хороший junior backend

- умеет разбирать задачу на маленькие этапы
- пишет понятный и тестируемый код
- задает вопросы по требованиям до начала реализации
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sprint0-golang-career",
			Title:       "Sprint 0.3: Кто такой Golang специалист",
			Description: "Обязанности Go backend инженера, уровни, зарплаты в РФ и мире, карьерные перспективы",
			Category:    "Sprint 0",
			Order:       10,
			Content: `# Sprint 0.3: Кто такой Golang специалист

## Чем занимается Golang backend инженер

- разрабатывает сервисы и API
- проектирует интеграции между системами
- работает с очередями, кэшем, БД и мониторингом
- участвует в релизах и поддержке стабильности

## Уровни развития

- Junior: выполняет задачи по четкому scope под ревью
- Middle: самостоятельно проектирует фичи
- Senior: принимает архитектурные решения и менторит

## Доходы и рынок

Зарплаты зависят от региона, домена, формата работы и уровня.

- Россия: широкая вилка по рынку, заметный рост от junior к middle
- Глобальный рынок: выше абсолютные вилки, выше требования к системному дизайну и английскому

## Перспективы

- рост в senior/backend architect
- переход в platform/devtools
- развитие в engineering management

Главная идея: сильная база в API и системном мышлении масштабируется на любую индустрию.
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-sql-and-pagination",
			Title:       "Sprint 2: Проект 2 — Blogging Platform API",
			Description: "roadmap.sh beginner: REST API для персональной блог-платформы",
			Category:    "Sprint 2",
			Order:       11,
			Content: `# Sprint 2: Проект 2 — Blogging Platform API

## 5 дней практики

1. День 1: модель Post и базовый CRUD
2. День 2: auth для автора и доступ к черновикам
3. День 3: публикация постов и статус draft/published
4. День 4: фильтрация и пагинация списка постов
5. День 5: валидация и единый формат ошибок

## Definition of Done

- блог API проходит сценарий create -> publish -> list -> update -> delete
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-git-and-prs",
			Title:       "Sprint 3: Проект 3 — Weather API Wrapper Service",
			Description: "roadmap.sh beginner: сервис-обертка над внешним weather API",
			Category:    "Sprint 3",
			Order:       12,
			Content: `# Sprint 3: Проект 3 — Weather API Wrapper Service

## 5 дней практики

1. День 1: endpoint запроса погоды по городу
2. День 2: интеграция с внешним API-провайдером
3. День 3: обработка ошибок и таймауты
4. День 4: кэширование ответа на короткий TTL
5. День 5: лимиты и логирование обращений

## Definition of Done

- API стабильно отдает погоду и изолирует клиента от внешних ошибок
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-concurrency-background",
			Title:       "Sprint 4: Проект 4 — Expense Tracker API",
			Description: "roadmap.sh beginner: API для учета расходов",
			Category:    "Sprint 4",
			Order:       13,
			Content: `# Sprint 4: Проект 4 — Expense Tracker API

## 5 дней практики

1. День 1: модель расхода и категории
2. День 2: CRUD транзакций
3. День 3: фильтры по дате и категории
4. День 4: агрегаты (день/неделя/месяц)
5. День 5: валидация валюты и корректность сумм

## Definition of Done

- пользователь видит корректные суммы и отчетность по периоду
`,
		},
		{
			Module:      "junior",
			Slug:        "junior-release-production",
			Title:       "Sprint 5: Проект 5 — GitHub User Activity CLI/API",
			Description: "roadmap.sh beginner: сбор и отображение активности пользователя GitHub",
			Category:    "Sprint 5",
			Order:       14,
			Content: `# Sprint 5: Проект 5 — GitHub User Activity CLI/API

## 5 дней практики

1. День 1: интеграция с GitHub API
2. День 2: получение и нормализация событий
3. День 3: фильтрация и группировка активности
4. День 4: вывод в удобном виде (CLI или endpoint)
5. День 5: кэширование и защита от rate limit GitHub

## Definition of Done

- активность пользователя собирается стабильно и читаемо отображается
`,
		},
	}
}

func juniorSprintExercises() []models.Exercise {
	type sprintTask struct {
		sprint      int
		title       string
		description string
		difficulty  string
		k           int
		b           int
	}

	tasks := []sprintTask{
		{1, "S1: Health Summary", "Реализуй BuildFeature(points int) int как базовый health-score спринта 1.", "easy", 2, 1},
		{1, "S1: Version Score", "Реализуй BuildFeature(points int) int для проверки версии и базовой конфигурации.", "easy", 3, 0},
		{2, "S2: Auth Score", "Реализуй BuildFeature(points int) int как оценку покрытых auth-сценариев.", "easy", 3, 2},
		{2, "S2: Token Flow Score", "Реализуй BuildFeature(points int) int как оценку JWT-потока и middleware.", "medium", 4, 1},
		{3, "S3: CRUD Score", "Реализуй BuildFeature(points int) int как оценку CRUD-функциональности.", "medium", 4, 2},
		{3, "S3: Filter Score", "Реализуй BuildFeature(points int) int как оценку фильтров и пагинации.", "medium", 5, 0},
		{4, "S4: Worker Score", "Реализуй BuildFeature(points int) int как оценку worker-pool и конкурентности.", "medium", 5, 1},
		{4, "S4: Retry Score", "Реализуй BuildFeature(points int) int как оценку retry и timeout логики.", "hard", 6, 0},
		{5, "S5: Release Score", "Реализуй BuildFeature(points int) int как оценку готовности к релизу.", "medium", 6, 2},
		{5, "S5: Production Score", "Реализуй BuildFeature(points int) int как оценку production readiness.", "hard", 7, 1},
	}

	result := make([]models.Exercise, 0, len(tasks))
	for i, t := range tasks {
		order := i + 1
		testCode := fmt.Sprintf(`package main

import "testing"

func TestBuildFeature(t *testing.T) {
    cases := []struct {
        points, want int
    }{
        {0, %d},
        {1, %d},
        {5, %d},
    }
    for _, c := range cases {
        got := BuildFeature(c.points)
        if got != c.want {
            t.Fatalf("BuildFeature(%%d) = %%d, want %%d", c.points, got, c.want)
        }
    }
}
`, t.b, t.k+t.b, 5*t.k+t.b)

		solutionCode := fmt.Sprintf(`package main

func BuildFeature(points int) int {
    return points*%d + %d
}
`, t.k, t.b)

		starterCode := `package main

func BuildFeature(points int) int {
    // TODO: implement
    return 0
}
`

		hints := fmt.Sprintf(`["Используй формулу y = points*%d + %d", "Проверь случаи points=0 и points=5"]`, t.k, t.b)

		result = append(result, models.Exercise{
			Module:       "junior",
			Order:        order,
			Title:        t.title,
			Description:  t.description,
			Difficulty:   t.difficulty,
			Category:     fmt.Sprintf("Sprint %d", t.sprint),
			StarterCode:  starterCode,
			SolutionCode: solutionCode,
			TestCode:     testCode,
			Hints:        hints,
		})
	}

	return result
}

func generatedPracticeExercises(module string, startOrder, endOrder int) []models.Exercise {
	_ = startOrder
	_ = endOrder
	return coreExercises(module)
}

type exerciseDef struct {
	order        int
	title        string
	description  string
	difficulty   string
	category     string
	starterCode  string
	solutionCode string
	testCode     string
	hints        string
}

func coreExercises(module string) []models.Exercise {
	defs := []exerciseDef{
		// ── Основы ──────────────────────────────────────────────────
		{
			order: 1, title: "Hello, Name!", difficulty: "easy", category: "Основы",
			description: "Напиши функцию Greet(name string) string, которая возвращает строку \"Hello, <name>!\".",
			starterCode: `package main

func Greet(name string) string {
    // TODO
    return ""
}
`,
			solutionCode: `package main

func Greet(name string) string {
    return "Hello, " + name + "!"
}
`,
			testCode: `package main

import "testing"

func TestGreet(t *testing.T) {
    cases := []struct{ name, want string }{
        {"Alice", "Hello, Alice!"},
        {"Bob",   "Hello, Bob!"},
        {"",      "Hello, !"},
    }
    for _, c := range cases {
        if got := Greet(c.name); got != c.want {
            t.Errorf("Greet(%q) = %q, want %q", c.name, got, c.want)
        }
    }
}
`,
			hints: `["Конкатенация строк через +", "Не забудь ! в конце"]`,
		},
		{
			order: 2, title: "Абсолютное значение", difficulty: "easy", category: "Основы",
			description: "Напиши функцию Abs(n int) int, которая возвращает абсолютное значение числа.",
			starterCode: `package main

func Abs(n int) int {
    // TODO
    return 0
}
`,
			solutionCode: `package main

func Abs(n int) int {
    if n < 0 {
        return -n
    }
    return n
}
`,
			testCode: `package main

import "testing"

func TestAbs(t *testing.T) {
    cases := []struct{ n, want int }{
        {5, 5}, {-5, 5}, {0, 0}, {-100, 100},
    }
    for _, c := range cases {
        if got := Abs(c.n); got != c.want {
            t.Errorf("Abs(%d) = %d, want %d", c.n, got, c.want)
        }
    }
}
`,
			hints: `["Используй if n < 0", "Отрицательное число: return -n"]`,
		},
		{
			order: 3, title: "Максимум двух чисел", difficulty: "easy", category: "Основы",
			description: "Напиши функцию Max(a, b int) int, которая возвращает большее из двух чисел.",
			starterCode: `package main

func Max(a, b int) int {
    // TODO
    return 0
}
`,
			solutionCode: `package main

func Max(a, b int) int {
    if a > b {
        return a
    }
    return b
}
`,
			testCode: `package main

import "testing"

func TestMax(t *testing.T) {
    cases := []struct{ a, b, want int }{
        {3, 5, 5}, {5, 3, 5}, {4, 4, 4}, {-1, -2, -1},
    }
    for _, c := range cases {
        if got := Max(c.a, c.b); got != c.want {
            t.Errorf("Max(%d,%d) = %d, want %d", c.a, c.b, got, c.want)
        }
    }
}
`,
			hints: `["Сравни a и b через if", "Если равны — вернуть любое"]`,
		},
		{
			order: 4, title: "Чётное или нечётное", difficulty: "easy", category: "Основы",
			description: "Напиши функцию IsEven(n int) bool, которая возвращает true если n чётное.",
			starterCode: `package main

func IsEven(n int) bool {
    // TODO
    return false
}
`,
			solutionCode: `package main

func IsEven(n int) bool {
    return n%2 == 0
}
`,
			testCode: `package main

import "testing"

func TestIsEven(t *testing.T) {
    cases := []struct {
        n    int
        want bool
    }{
        {2, true}, {3, false}, {0, true}, {-4, true}, {-3, false},
    }
    for _, c := range cases {
        if got := IsEven(c.n); got != c.want {
            t.Errorf("IsEven(%d) = %v, want %v", c.n, got, c.want)
        }
    }
}
`,
			hints: `["Оператор остатка %", "n%2 == 0 → чётное"]`,
		},
		{
			order: 5, title: "FizzBuzz", difficulty: "easy", category: "Основы",
			description: "Напиши функцию FizzBuzz(n int) string: \"Fizz\" если делится на 3, \"Buzz\" если на 5, \"FizzBuzz\" если на оба, иначе строковое число.",
			starterCode: `package main

import "strconv"

func FizzBuzz(n int) string {
    // TODO
    return ""
}
`,
			solutionCode: `package main

import "strconv"

func FizzBuzz(n int) string {
    switch {
    case n%15 == 0:
        return "FizzBuzz"
    case n%3 == 0:
        return "Fizz"
    case n%5 == 0:
        return "Buzz"
    default:
        return strconv.Itoa(n)
    }
}
`,
			testCode: `package main

import "testing"

func TestFizzBuzz(t *testing.T) {
    cases := []struct {
        n    int
        want string
    }{
        {1, "1"}, {3, "Fizz"}, {5, "Buzz"}, {15, "FizzBuzz"}, {7, "7"}, {30, "FizzBuzz"},
    }
    for _, c := range cases {
        if got := FizzBuzz(c.n); got != c.want {
            t.Errorf("FizzBuzz(%d) = %q, want %q", c.n, got, c.want)
        }
    }
}
`,
			hints: `["Сначала проверь n%15", "strconv.Itoa для числа в строку"]`,
		},
		// ── Функции ─────────────────────────────────────────────────
		{
			order: 6, title: "Факториал", difficulty: "easy", category: "Функции",
			description: "Напиши функцию Factorial(n int) int, которая возвращает n! (0! = 1).",
			starterCode: `package main

func Factorial(n int) int {
    // TODO
    return 0
}
`,
			solutionCode: `package main

func Factorial(n int) int {
    if n <= 0 {
        return 1
    }
    return n * Factorial(n-1)
}
`,
			testCode: `package main

import "testing"

func TestFactorial(t *testing.T) {
    cases := []struct{ n, want int }{
        {0, 1}, {1, 1}, {5, 120}, {6, 720},
    }
    for _, c := range cases {
        if got := Factorial(c.n); got != c.want {
            t.Errorf("Factorial(%d) = %d, want %d", c.n, got, c.want)
        }
    }
}
`,
			hints: `["Базовый случай: n<=0 → 1", "Рекурсия: n * Factorial(n-1)"]`,
		},
		{
			order: 7, title: "Сумма слайса", difficulty: "easy", category: "Функции",
			description: "Напиши функцию Sum(nums []int) int, которая возвращает сумму элементов слайса.",
			starterCode: `package main

func Sum(nums []int) int {
    // TODO
    return 0
}
`,
			solutionCode: `package main

func Sum(nums []int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
`,
			testCode: `package main

import "testing"

func TestSum(t *testing.T) {
    cases := []struct {
        nums []int
        want int
    }{
        {[]int{1, 2, 3}, 6},
        {[]int{}, 0},
        {[]int{-1, -2, 3}, 0},
        {[]int{10}, 10},
    }
    for _, c := range cases {
        if got := Sum(c.nums); got != c.want {
            t.Errorf("Sum(%v) = %d, want %d", c.nums, got, c.want)
        }
    }
}
`,
			hints: `["Используй range для итерации", "Начни с total := 0"]`,
		},
		{
			order: 8, title: "Деление с ошибкой", difficulty: "easy", category: "Функции",
			description: "Напиши функцию Divide(a, b float64) (float64, error). При b==0 вернуть ошибку \"division by zero\".",
			starterCode: `package main

import "errors"

func Divide(a, b float64) (float64, error) {
    // TODO
    return 0, nil
}
`,
			solutionCode: `package main

import "errors"

func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
`,
			testCode: `package main

import (
    "errors"
    "testing"
)

func TestDivide(t *testing.T) {
    r, err := Divide(10, 2)
    if err != nil || r != 5 {
        t.Errorf("Divide(10,2) = %v, %v; want 5, nil", r, err)
    }
    _, err = Divide(5, 0)
    if err == nil {
        t.Error("Divide(5,0) should return error")
    }
    _ = errors.New("ok")
}
`,
			hints: `["errors.New(\"...\") для создания ошибки", "Возврат двух значений: result, error"]`,
		},
		{
			order: 9, title: "Функция-замыкание: счётчик", difficulty: "medium", category: "Функции",
			description: "Напиши функцию MakeCounter() func() int, которая возвращает функцию-счётчик. Каждый вызов возвращает следующее целое: 1, 2, 3...",
			starterCode: `package main

func MakeCounter() func() int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func MakeCounter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}
`,
			testCode: `package main

import "testing"

func TestMakeCounter(t *testing.T) {
    c := MakeCounter()
    if got := c(); got != 1 {
        t.Errorf("first call = %d, want 1", got)
    }
    if got := c(); got != 2 {
        t.Errorf("second call = %d, want 2", got)
    }
    if got := c(); got != 3 {
        t.Errorf("third call = %d, want 3", got)
    }
    // независимый счётчик
    c2 := MakeCounter()
    if got := c2(); got != 1 {
        t.Errorf("independent counter first call = %d, want 1", got)
    }
}
`,
			hints: `["Замыкание захватывает переменную count", "count объяви снаружи возвращаемой функции"]`,
		},
		{
			order: 10, title: "Применить функцию к слайсу", difficulty: "medium", category: "Функции",
			description: "Напиши функцию Map(nums []int, f func(int) int) []int, которая применяет f к каждому элементу и возвращает новый слайс.",
			starterCode: `package main

func Map(nums []int, f func(int) int) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func Map(nums []int, f func(int) int) []int {
    result := make([]int, len(nums))
    for i, v := range nums {
        result[i] = f(v)
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestMap(t *testing.T) {
    double := func(x int) int { return x * 2 }
    got := Map([]int{1, 2, 3}, double)
    want := []int{2, 4, 6}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("Map double = %v, want %v", got, want)
    }
    got2 := Map([]int{}, double)
    if len(got2) != 0 {
        t.Errorf("Map empty slice should return empty, got %v", got2)
    }
}
`,
			hints: `["make([]int, len(nums)) для результата", "Функция в Go — первоклассный тип"]`,
		},
		// ── Слайсы ──────────────────────────────────────────────────
		{
			order: 11, title: "Реверс слайса", difficulty: "easy", category: "Слайсы",
			description: "Напиши функцию Reverse(s []int) []int, которая возвращает новый слайс с элементами в обратном порядке.",
			starterCode: `package main

func Reverse(s []int) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func Reverse(s []int) []int {
    result := make([]int, len(s))
    for i, v := range s {
        result[len(s)-1-i] = v
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestReverse(t *testing.T) {
    cases := []struct {
        input, want []int
    }{
        {[]int{1, 2, 3}, []int{3, 2, 1}},
        {[]int{1}, []int{1}},
        {[]int{}, []int{}},
    }
    for _, c := range cases {
        got := Reverse(c.input)
        if !reflect.DeepEqual(got, c.want) {
            t.Errorf("Reverse(%v) = %v, want %v", c.input, got, c.want)
        }
    }
}
`,
			hints: `["result[len(s)-1-i] = s[i]", "Или два указателя с двух сторон"]`,
		},
		{
			order: 12, title: "Уникальные элементы", difficulty: "easy", category: "Слайсы",
			description: "Напиши функцию Unique(s []int) []int, которая возвращает слайс без дубликатов (порядок сохраняется).",
			starterCode: `package main

func Unique(s []int) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func Unique(s []int) []int {
    seen := make(map[int]bool)
    result := []int{}
    for _, v := range s {
        if !seen[v] {
            seen[v] = true
            result = append(result, v)
        }
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestUnique(t *testing.T) {
    cases := []struct {
        input, want []int
    }{
        {[]int{1, 2, 2, 3, 1}, []int{1, 2, 3}},
        {[]int{1, 2, 3}, []int{1, 2, 3}},
        {[]int{}, []int{}},
    }
    for _, c := range cases {
        got := Unique(c.input)
        if !reflect.DeepEqual(got, c.want) {
            t.Errorf("Unique(%v) = %v, want %v", c.input, got, c.want)
        }
    }
}
`,
			hints: `["Используй map[int]bool для отслеживания виденных", "append для добавления в результат"]`,
		},
		{
			order: 13, title: "Фильтрация слайса", difficulty: "easy", category: "Слайсы",
			description: "Напиши функцию Filter(s []int, pred func(int) bool) []int, которая возвращает элементы, для которых pred возвращает true.",
			starterCode: `package main

func Filter(s []int, pred func(int) bool) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func Filter(s []int, pred func(int) bool) []int {
    result := []int{}
    for _, v := range s {
        if pred(v) {
            result = append(result, v)
        }
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestFilter(t *testing.T) {
    isEven := func(n int) bool { return n%2 == 0 }
    got := Filter([]int{1, 2, 3, 4, 5}, isEven)
    want := []int{2, 4}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("Filter evens = %v, want %v", got, want)
    }
    got2 := Filter([]int{1, 3, 5}, isEven)
    if len(got2) != 0 {
        t.Errorf("Filter no evens = %v, want []", got2)
    }
}
`,
			hints: `["Вызывай pred(v) для каждого элемента", "append только если pred вернул true"]`,
		},
		{
			order: 14, title: "Слияние двух отсортированных слайсов", difficulty: "medium", category: "Слайсы",
			description: "Напиши функцию Merge(a, b []int) []int, которая сливает два отсортированных слайса в один отсортированный.",
			starterCode: `package main

func Merge(a, b []int) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func Merge(a, b []int) []int {
    result := make([]int, 0, len(a)+len(b))
    i, j := 0, 0
    for i < len(a) && j < len(b) {
        if a[i] <= b[j] {
            result = append(result, a[i])
            i++
        } else {
            result = append(result, b[j])
            j++
        }
    }
    result = append(result, a[i:]...)
    result = append(result, b[j:]...)
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestMerge(t *testing.T) {
    cases := []struct {
        a, b, want []int
    }{
        {[]int{1, 3, 5}, []int{2, 4, 6}, []int{1, 2, 3, 4, 5, 6}},
        {[]int{1, 2, 3}, []int{}, []int{1, 2, 3}},
        {[]int{}, []int{1}, []int{1}},
    }
    for _, c := range cases {
        got := Merge(c.a, c.b)
        if !reflect.DeepEqual(got, c.want) {
            t.Errorf("Merge(%v,%v) = %v, want %v", c.a, c.b, got, c.want)
        }
    }
}
`,
			hints: `["Два указателя i и j", "Добавь хвост через append(result, a[i:]...)"]`,
		},
		{
			order: 15, title: "Скользящее среднее", difficulty: "medium", category: "Слайсы",
			description: "Напиши функцию MovingAverage(data []float64, window int) []float64, которая возвращает скользящее среднее с заданным окном.",
			starterCode: `package main

func MovingAverage(data []float64, window int) []float64 {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func MovingAverage(data []float64, window int) []float64 {
    if window <= 0 || len(data) < window {
        return []float64{}
    }
    result := make([]float64, 0, len(data)-window+1)
    var sum float64
    for i := 0; i < window; i++ {
        sum += data[i]
    }
    result = append(result, sum/float64(window))
    for i := window; i < len(data); i++ {
        sum += data[i] - data[i-window]
        result = append(result, sum/float64(window))
    }
    return result
}
`,
			testCode: `package main

import (
    "math"
    "testing"
)

func approxEqual(a, b float64) bool { return math.Abs(a-b) < 1e-9 }

func TestMovingAverage(t *testing.T) {
    got := MovingAverage([]float64{1, 2, 3, 4, 5}, 3)
    want := []float64{2, 3, 4}
    if len(got) != len(want) {
        t.Fatalf("len = %d, want %d", len(got), len(want))
    }
    for i := range want {
        if !approxEqual(got[i], want[i]) {
            t.Errorf("[%d] = %f, want %f", i, got[i], want[i])
        }
    }
    if len(MovingAverage([]float64{1, 2}, 5)) != 0 {
        t.Error("window > len should return []")
    }
}
`,
			hints: `["Сначала посчитай сумму первого окна", "Потом скользи: sum += data[i] - data[i-window]"]`,
		},
		// ── Maps ────────────────────────────────────────────────────
		{
			order: 16, title: "Подсчёт слов", difficulty: "easy", category: "Maps",
			description: "Напиши функцию WordCount(s string) map[string]int, которая подсчитывает кол-во вхождений каждого слова (разделитель — пробел).",
			starterCode: `package main

import "strings"

func WordCount(s string) map[string]int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

import "strings"

func WordCount(s string) map[string]int {
    counts := make(map[string]int)
    for _, word := range strings.Fields(s) {
        counts[word]++
    }
    return counts
}
`,
			testCode: `package main

import "testing"

func TestWordCount(t *testing.T) {
    got := WordCount("the quick brown fox jumps over the lazy dog the")
    if got["the"] != 3 {
        t.Errorf("the = %d, want 3", got["the"])
    }
    if got["fox"] != 1 {
        t.Errorf("fox = %d, want 1", got["fox"])
    }
    empty := WordCount("")
    if len(empty) != 0 {
        t.Errorf("empty string should return empty map, got %v", empty)
    }
}
`,
			hints: `["strings.Fields разбивает по пробелам", "counts[word]++ работает даже если ключа нет (нулевое значение 0)"]`,
		},
		{
			order: 17, title: "Группировка по первой букве", difficulty: "easy", category: "Maps",
			description: "Напиши функцию GroupByFirstLetter(words []string) map[string][]string, которая группирует слова по первой букве.",
			starterCode: `package main

func GroupByFirstLetter(words []string) map[string][]string {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func GroupByFirstLetter(words []string) map[string][]string {
    result := make(map[string][]string)
    for _, w := range words {
        if len(w) == 0 {
            continue
        }
        key := string(w[0])
        result[key] = append(result[key], w)
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "sort"
    "testing"
)

func TestGroupByFirstLetter(t *testing.T) {
    words := []string{"apple", "ant", "banana", "avocado", "blueberry"}
    got := GroupByFirstLetter(words)
    sort.Strings(got["a"])
    sort.Strings(got["b"])
    wantA := []string{"ant", "apple", "avocado"}
    wantB := []string{"banana", "blueberry"}
    if !reflect.DeepEqual(got["a"], wantA) {
        t.Errorf("a = %v, want %v", got["a"], wantA)
    }
    if !reflect.DeepEqual(got["b"], wantB) {
        t.Errorf("b = %v, want %v", got["b"], wantB)
    }
}
`,
			hints: `["string(w[0]) — первый байт как строка", "append к существующему или nil слайсу работает одинаково"]`,
		},
		{
			order: 18, title: "Инвертировать map", difficulty: "easy", category: "Maps",
			description: "Напиши функцию InvertMap(m map[string]string) map[string]string, которая меняет ключи и значения местами.",
			starterCode: `package main

func InvertMap(m map[string]string) map[string]string {
    // TODO
    return nil
}
`,
			solutionCode: `package main

func InvertMap(m map[string]string) map[string]string {
    result := make(map[string]string, len(m))
    for k, v := range m {
        result[v] = k
    }
    return result
}
`,
			testCode: `package main

import "testing"

func TestInvertMap(t *testing.T) {
    m := map[string]string{"a": "1", "b": "2", "c": "3"}
    got := InvertMap(m)
    if got["1"] != "a" || got["2"] != "b" || got["3"] != "c" {
        t.Errorf("InvertMap = %v", got)
    }
    empty := InvertMap(map[string]string{})
    if len(empty) != 0 {
        t.Error("empty map inverted should be empty")
    }
}
`,
			hints: `["result[v] = k", "make(map[string]string, len(m)) — сразу с нужным capacity"]`,
		},
		{
			order: 19, title: "Топ N слов", difficulty: "medium", category: "Maps",
			description: "Напиши функцию TopN(words []string, n int) []string, которая возвращает n наиболее частых слов, отсортированных по убыванию частоты.",
			starterCode: `package main

import "sort"

func TopN(words []string, n int) []string {
    // TODO
    return nil
}
`,
			solutionCode: `package main

import "sort"

func TopN(words []string, n int) []string {
    counts := make(map[string]int)
    for _, w := range words {
        counts[w]++
    }
    type pair struct {
        word  string
        count int
    }
    pairs := make([]pair, 0, len(counts))
    for w, c := range counts {
        pairs = append(pairs, pair{w, c})
    }
    sort.Slice(pairs, func(i, j int) bool {
        if pairs[i].count != pairs[j].count {
            return pairs[i].count > pairs[j].count
        }
        return pairs[i].word < pairs[j].word
    })
    result := make([]string, 0, n)
    for i := 0; i < n && i < len(pairs); i++ {
        result = append(result, pairs[i].word)
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestTopN(t *testing.T) {
    words := []string{"a", "b", "a", "c", "b", "a"}
    got := TopN(words, 2)
    want := []string{"a", "b"}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("TopN = %v, want %v", got, want)
    }
    if len(TopN(words, 0)) != 0 {
        t.Error("TopN 0 should return empty")
    }
}
`,
			hints: `["Сначала подсчитай частоты через map", "sort.Slice для сортировки пар (слово, кол-во)"]`,
		},
		{
			order: 20, title: "Кэш с TTL (заглушка)", difficulty: "medium", category: "Maps",
			description: "Напиши структуру Cache и методы Set(key, value string) и Get(key string) (string, bool). Хранит string→string пары.",
			starterCode: `package main

type Cache struct {
    // TODO
}

func NewCache() *Cache {
    // TODO
    return nil
}

func (c *Cache) Set(key, value string) {
    // TODO
}

func (c *Cache) Get(key string) (string, bool) {
    // TODO
    return "", false
}
`,
			solutionCode: `package main

type Cache struct {
    data map[string]string
}

func NewCache() *Cache {
    return &Cache{data: make(map[string]string)}
}

func (c *Cache) Set(key, value string) {
    c.data[key] = value
}

func (c *Cache) Get(key string) (string, bool) {
    v, ok := c.data[key]
    return v, ok
}
`,
			testCode: `package main

import "testing"

func TestCache(t *testing.T) {
    c := NewCache()
    c.Set("name", "Alice")
    v, ok := c.Get("name")
    if !ok || v != "Alice" {
        t.Errorf("Get name = %q, %v; want Alice, true", v, ok)
    }
    _, ok = c.Get("missing")
    if ok {
        t.Error("Get missing key should return false")
    }
    c.Set("name", "Bob")
    v, _ = c.Get("name")
    if v != "Bob" {
        t.Errorf("overwritten = %q, want Bob", v)
    }
}
`,
			hints: `["map[string]string внутри структуры", "Pointer receiver: func (c *Cache)"]`,
		},
		// ── Структуры ────────────────────────────────────────────────
		{
			order: 21, title: "Структура Point и расстояние", difficulty: "easy", category: "Структуры",
			description: "Создай структуру Point{X, Y float64} и метод Distance(other Point) float64. Евклидово расстояние.",
			starterCode: `package main

import "math"

type Point struct {
    X, Y float64
}

func (p Point) Distance(other Point) float64 {
    // TODO
    return 0
}
`,
			solutionCode: `package main

import "math"

type Point struct {
    X, Y float64
}

func (p Point) Distance(other Point) float64 {
    dx := p.X - other.X
    dy := p.Y - other.Y
    return math.Sqrt(dx*dx + dy*dy)
}
`,
			testCode: `package main

import (
    "math"
    "testing"
)

func TestDistance(t *testing.T) {
    p1 := Point{0, 0}
    p2 := Point{3, 4}
    got := p1.Distance(p2)
    if math.Abs(got-5) > 1e-9 {
        t.Errorf("Distance = %f, want 5", got)
    }
    if p1.Distance(p1) != 0 {
        t.Error("Distance to self should be 0")
    }
}
`,
			hints: `["math.Sqrt из пакета math", "dx*dx + dy*dy — теорема Пифагора"]`,
		},
		{
			order: 22, title: "Стек на структуре", difficulty: "easy", category: "Структуры",
			description: "Реализуй стек: тип Stack с методами Push(v int), Pop() (int, bool), Peek() (int, bool), IsEmpty() bool.",
			starterCode: `package main

type Stack struct {
    // TODO
}

func (s *Stack) Push(v int)          {}
func (s *Stack) Pop() (int, bool)    { return 0, false }
func (s *Stack) Peek() (int, bool)   { return 0, false }
func (s *Stack) IsEmpty() bool       { return true }
`,
			solutionCode: `package main

type Stack struct {
    data []int
}

func (s *Stack) Push(v int) {
    s.data = append(s.data, v)
}

func (s *Stack) Pop() (int, bool) {
    if len(s.data) == 0 {
        return 0, false
    }
    v := s.data[len(s.data)-1]
    s.data = s.data[:len(s.data)-1]
    return v, true
}

func (s *Stack) Peek() (int, bool) {
    if len(s.data) == 0 {
        return 0, false
    }
    return s.data[len(s.data)-1], true
}

func (s *Stack) IsEmpty() bool {
    return len(s.data) == 0
}
`,
			testCode: `package main

import "testing"

func TestStack(t *testing.T) {
    var s Stack
    if !s.IsEmpty() { t.Error("new stack should be empty") }
    s.Push(1)
    s.Push(2)
    s.Push(3)
    if v, ok := s.Peek(); !ok || v != 3 {
        t.Errorf("Peek = %d, %v; want 3, true", v, ok)
    }
    if v, ok := s.Pop(); !ok || v != 3 {
        t.Errorf("Pop = %d, %v; want 3, true", v, ok)
    }
    if v, ok := s.Pop(); !ok || v != 2 { t.Errorf("Pop = %d", v) }
    if v, ok := s.Pop(); !ok || v != 1 { t.Errorf("Pop = %d", v) }
    if _, ok := s.Pop(); ok { t.Error("Pop on empty should return false") }
}
`,
			hints: `["[]int как внутреннее хранилище", "Pop: взять последний, обрезать слайс"]`,
		},
		{
			order: 23, title: "Связанный список", difficulty: "medium", category: "Структуры",
			description: "Реализуй односвязный список: Node{Val int; Next *Node}, функции Prepend(head *Node, val int) *Node и ToSlice(head *Node) []int.",
			starterCode: `package main

type Node struct {
    Val  int
    Next *Node
}

func Prepend(head *Node, val int) *Node {
    // TODO
    return nil
}

func ToSlice(head *Node) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

type Node struct {
    Val  int
    Next *Node
}

func Prepend(head *Node, val int) *Node {
    return &Node{Val: val, Next: head}
}

func ToSlice(head *Node) []int {
    result := []int{}
    for head != nil {
        result = append(result, head.Val)
        head = head.Next
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestLinkedList(t *testing.T) {
    var head *Node
    head = Prepend(head, 3)
    head = Prepend(head, 2)
    head = Prepend(head, 1)
    got := ToSlice(head)
    want := []int{1, 2, 3}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("ToSlice = %v, want %v", got, want)
    }
    if ToSlice(nil) == nil {
        // ok, or empty slice — both fine
    }
}
`,
			hints: `["Prepend: new node указывает на старый head", "ToSlice: while head != nil"]`,
		},
		{
			order: 24, title: "Очередь (Queue)", difficulty: "medium", category: "Структуры",
			description: "Реализуй очередь FIFO: методы Enqueue(v int), Dequeue() (int, bool), Size() int.",
			starterCode: `package main

type Queue struct {
    // TODO
}

func (q *Queue) Enqueue(v int)       {}
func (q *Queue) Dequeue() (int, bool) { return 0, false }
func (q *Queue) Size() int           { return 0 }
`,
			solutionCode: `package main

type Queue struct {
    data []int
}

func (q *Queue) Enqueue(v int) {
    q.data = append(q.data, v)
}

func (q *Queue) Dequeue() (int, bool) {
    if len(q.data) == 0 {
        return 0, false
    }
    v := q.data[0]
    q.data = q.data[1:]
    return v, true
}

func (q *Queue) Size() int {
    return len(q.data)
}
`,
			testCode: `package main

import "testing"

func TestQueue(t *testing.T) {
    var q Queue
    if q.Size() != 0 { t.Error("empty size") }
    q.Enqueue(10)
    q.Enqueue(20)
    q.Enqueue(30)
    if q.Size() != 3 { t.Errorf("size = %d, want 3", q.Size()) }
    v, ok := q.Dequeue()
    if !ok || v != 10 { t.Errorf("Dequeue = %d, want 10", v) }
    v, ok = q.Dequeue()
    if !ok || v != 20 { t.Errorf("Dequeue = %d, want 20", v) }
    if q.Size() != 1 { t.Errorf("size = %d, want 1", q.Size()) }
    _, ok = q.Dequeue()
    if !ok { t.Error("should succeed") }
    _, ok = q.Dequeue()
    if ok { t.Error("empty dequeue should fail") }
}
`,
			hints: `["Enqueue: append в конец", "Dequeue: взять data[0], обрезать data = data[1:]"]`,
		},
		{
			order: 25, title: "JSON-структура пользователя", difficulty: "easy", category: "Структуры",
			description: "Создай структуру User{ID int; Name string; Email string} и функцию NewUser(id int, name, email string) User. Проверок не требуется.",
			starterCode: `package main

type User struct {
    // TODO
}

func NewUser(id int, name, email string) User {
    // TODO
    return User{}
}
`,
			solutionCode: `package main

type User struct {
    ID    int    ` + "`" + `json:"id"` + "`" + `
    Name  string ` + "`" + `json:"name"` + "`" + `
    Email string ` + "`" + `json:"email"` + "`" + `
}

func NewUser(id int, name, email string) User {
    return User{ID: id, Name: name, Email: email}
}
`,
			testCode: `package main

import "testing"

func TestNewUser(t *testing.T) {
    u := NewUser(1, "Alice", "alice@example.com")
    if u.ID != 1 { t.Errorf("ID = %d, want 1", u.ID) }
    if u.Name != "Alice" { t.Errorf("Name = %q, want Alice", u.Name) }
    if u.Email != "alice@example.com" { t.Errorf("Email = %q", u.Email) }
}
`,
			hints: `["struct literal: User{ID: id, ...}", "json теги пишутся в backticks"]`,
		},
		// ── Интерфейсы ───────────────────────────────────────────────
		{
			order: 26, title: "Интерфейс Shape", difficulty: "easy", category: "Интерфейсы",
			description: "Объяви интерфейс Shape с методами Area() float64 и Perimeter() float64. Реализуй для Rectangle{Width, Height float64} и Circle{Radius float64}.",
			starterCode: `package main

import "math"

type Shape interface {
    // TODO
}

type Rectangle struct{ Width, Height float64 }
type Circle struct{ Radius float64 }

// TODO: реализуй методы
`,
			solutionCode: `package main

import "math"

type Shape interface {
    Area() float64
    Perimeter() float64
}

type Rectangle struct{ Width, Height float64 }
type Circle struct{ Radius float64 }

func (r Rectangle) Area() float64      { return r.Width * r.Height }
func (r Rectangle) Perimeter() float64 { return 2 * (r.Width + r.Height) }

func (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }
`,
			testCode: `package main

import (
    "math"
    "testing"
)

func TestShapes(t *testing.T) {
    r := Rectangle{3, 4}
    if r.Area() != 12 { t.Errorf("rect area = %f, want 12", r.Area()) }
    if r.Perimeter() != 14 { t.Errorf("rect perimeter = %f, want 14", r.Perimeter()) }

    c := Circle{5}
    if math.Abs(c.Area()-math.Pi*25) > 1e-9 { t.Errorf("circle area wrong: %f", c.Area()) }

    shapes := []Shape{Rectangle{2, 3}, Circle{1}}
    for _, s := range shapes {
        if s.Area() <= 0 { t.Error("area should be positive") }
    }
}
`,
			hints: `["Rectangle.Area = Width*Height", "Circle.Area = math.Pi * r * r"]`,
		},
		{
			order: 27, title: "Интерфейс Stringer", difficulty: "easy", category: "Интерфейсы",
			description: "Создай тип Temperature float64 и реализуй метод String() string. Например, Temperature(36.6).String() → \"36.60°C\".",
			starterCode: `package main

import "fmt"

type Temperature float64

func (t Temperature) String() string {
    // TODO
    return ""
}
`,
			solutionCode: `package main

import "fmt"

type Temperature float64

func (t Temperature) String() string {
    return fmt.Sprintf("%.2f°C", float64(t))
}
`,
			testCode: `package main

import "testing"

func TestTemperatureString(t *testing.T) {
    cases := []struct {
        temp Temperature
        want string
    }{
        {36.6, "36.60°C"},
        {0, "0.00°C"},
        {-10.5, "-10.50°C"},
        {100, "100.00°C"},
    }
    for _, c := range cases {
        got := c.temp.String()
        if got != c.want {
            t.Errorf("Temperature(%v).String() = %q, want %q", c.temp, got, c.want)
        }
    }
}
`,
			hints: `["fmt.Sprintf с форматом %.2f", "Символ ° = \"°\""]`,
		},
		{
			order: 28, title: "Сортировка через sort.Interface", difficulty: "medium", category: "Интерфейсы",
			description: "Создай тип ByLength []string и реализуй sort.Interface (Len, Less, Swap) для сортировки строк по длине.",
			starterCode: `package main

type ByLength []string

func (s ByLength) Len() int           { return 0 }
func (s ByLength) Less(i, j int) bool { return false }
func (s ByLength) Swap(i, j int)      {}
`,
			solutionCode: `package main

type ByLength []string

func (s ByLength) Len() int           { return len(s) }
func (s ByLength) Less(i, j int) bool { return len(s[i]) < len(s[j]) }
func (s ByLength) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }
`,
			testCode: `package main

import (
    "reflect"
    "sort"
    "testing"
)

func TestByLength(t *testing.T) {
    words := ByLength{"banana", "apple", "kiwi", "fig"}
    sort.Sort(words)
    want := ByLength{"fig", "kiwi", "apple", "banana"}
    if !reflect.DeepEqual(words, want) {
        t.Errorf("sorted = %v, want %v", words, want)
    }
}
`,
			hints: `["Len(): len(s)", "Less(i,j): len(s[i]) < len(s[j])"]`,
		},
		{
			order: 29, title: "Middleware цепочка", difficulty: "medium", category: "Интерфейсы",
			description: "Объяви тип Handler func(msg string) string и функцию Chain(h Handler, middlewares ...func(Handler) Handler) Handler, применяющую middleware по порядку.",
			starterCode: `package main

type Handler func(msg string) string

func Chain(h Handler, middlewares ...func(Handler) Handler) Handler {
    // TODO
    return nil
}
`,
			solutionCode: `package main

type Handler func(msg string) string

func Chain(h Handler, middlewares ...func(Handler) Handler) Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        h = middlewares[i](h)
    }
    return h
}
`,
			testCode: `package main

import (
    "strings"
    "testing"
)

func TestChain(t *testing.T) {
    base := Handler(func(msg string) string { return msg })
    upper := func(next Handler) Handler {
        return func(msg string) Handler {
            return func(msg string) string {
                return strings.ToUpper(next(msg))
            }
        }(next)
    }
    exclaim := func(next Handler) Handler {
        return func(msg string) string {
            return next(msg) + "!"
        }
    }
    h := Chain(base, upper, exclaim)
    got := h("hello")
    if got != "HELLO!" {
        t.Errorf("Chain = %q, want HELLO!", got)
    }
}
`,
			hints: `["Применяй middleware в обратном порядке", "Каждый middleware оборачивает предыдущий handler"]`,
		},
		{
			order: 30, title: "Тип-обёртка с валидацией", difficulty: "medium", category: "Интерфейсы",
			description: "Создай тип Email string и функцию NewEmail(s string) (Email, error). Email валиден если содержит @ и не пустой.",
			starterCode: `package main

import "errors"

type Email string

func NewEmail(s string) (Email, error) {
    // TODO
    return "", nil
}
`,
			solutionCode: `package main

import (
    "errors"
    "strings"
)

type Email string

func NewEmail(s string) (Email, error) {
    if s == "" {
        return "", errors.New("email cannot be empty")
    }
    if !strings.Contains(s, "@") {
        return "", errors.New("email must contain @")
    }
    return Email(s), nil
}
`,
			testCode: `package main

import "testing"

func TestNewEmail(t *testing.T) {
    e, err := NewEmail("user@example.com")
    if err != nil || string(e) != "user@example.com" {
        t.Errorf("valid email failed: %v", err)
    }
    _, err = NewEmail("")
    if err == nil { t.Error("empty should fail") }
    _, err = NewEmail("notanemail")
    if err == nil { t.Error("no @ should fail") }
}
`,
			hints: `["strings.Contains(s, \"@\")", "errors.New для ошибки"]`,
		},
		// ── Обработка ошибок ────────────────────────────────────────
		{
			order: 31, title: "Кастомная ошибка", difficulty: "easy", category: "Ошибки",
			description: "Создай тип NotFoundError{ID int} реализующий интерфейс error. Метод Error() должен возвращать \"not found: id=<ID>\".",
			starterCode: `package main

import "fmt"

type NotFoundError struct {
    ID int
}

func (e *NotFoundError) Error() string {
    // TODO
    return ""
}
`,
			solutionCode: `package main

import "fmt"

type NotFoundError struct {
    ID int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("not found: id=%d", e.ID)
}
`,
			testCode: `package main

import (
    "errors"
    "testing"
)

func TestNotFoundError(t *testing.T) {
    err := &NotFoundError{ID: 42}
    want := "not found: id=42"
    if err.Error() != want {
        t.Errorf("Error() = %q, want %q", err.Error(), want)
    }
    var nfe *NotFoundError
    if !errors.As(err, &nfe) {
        t.Error("errors.As should work")
    }
    if nfe.ID != 42 {
        t.Errorf("ID = %d, want 42", nfe.ID)
    }
}
`,
			hints: `["fmt.Sprintf с форматом", "Pointer receiver: func (e *NotFoundError)"]`,
		},
		{
			order: 32, title: "Wrapping ошибок", difficulty: "easy", category: "Ошибки",
			description: "Напиши функцию FetchUser(id int) error. Если id <= 0 — вернуть ошибку ErrInvalidID, обёрнутую с контекстом через fmt.Errorf %w.",
			starterCode: `package main

import (
    "errors"
    "fmt"
)

var ErrInvalidID = errors.New("invalid id")

func FetchUser(id int) error {
    // TODO
    return nil
}
`,
			solutionCode: `package main

import (
    "errors"
    "fmt"
)

var ErrInvalidID = errors.New("invalid id")

func FetchUser(id int) error {
    if id <= 0 {
        return fmt.Errorf("FetchUser: %w", ErrInvalidID)
    }
    return nil
}
`,
			testCode: `package main

import (
    "errors"
    "testing"
)

func TestFetchUser(t *testing.T) {
    err := FetchUser(-1)
    if err == nil {
        t.Fatal("expected error for id=-1")
    }
    if !errors.Is(err, ErrInvalidID) {
        t.Errorf("expected ErrInvalidID wrapped, got %v", err)
    }
    if err2 := FetchUser(1); err2 != nil {
        t.Errorf("expected nil for id=1, got %v", err2)
    }
}
`,
			hints: `["fmt.Errorf(\"...: %w\", err) для wrapping", "errors.Is проверяет по цепочке wrap"]`,
		},
		{
			order: 33, title: "Паника и recover", difficulty: "medium", category: "Ошибки",
			description: "Напиши функцию SafeDiv(a, b int) (result int, err error). При b==0 должна вернуть ошибку, не паникуя. Используй defer + recover.",
			starterCode: `package main

func SafeDiv(a, b int) (result int, err error) {
    // TODO: используй defer + recover
    return a / b, nil
}
`,
			solutionCode: `package main

import (
    "errors"
    "fmt"
)

func SafeDiv(a, b int) (result int, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic recovered: %v", r)
        }
    }()
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}
`,
			testCode: `package main

import "testing"

func TestSafeDiv(t *testing.T) {
    r, err := SafeDiv(10, 2)
    if err != nil || r != 5 {
        t.Errorf("SafeDiv(10,2) = %d, %v; want 5, nil", r, err)
    }
    _, err = SafeDiv(10, 0)
    if err == nil {
        t.Error("expected error for div by 0")
    }
}
`,
			hints: `["defer func() { if r := recover(); r != nil {...} }()", "Именованные возвращаемые значения удобны с recover"]`,
		},
		// ── Строки ───────────────────────────────────────────────────
		{
			order: 34, title: "Палиндром", difficulty: "easy", category: "Строки",
			description: "Напиши функцию IsPalindrome(s string) bool — возвращает true если строка одинаково читается в обоих направлениях (только ASCII).",
			starterCode: `package main

func IsPalindrome(s string) bool {
    // TODO
    return false
}
`,
			solutionCode: `package main

func IsPalindrome(s string) bool {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        if runes[i] != runes[j] {
            return false
        }
    }
    return true
}
`,
			testCode: `package main

import "testing"

func TestIsPalindrome(t *testing.T) {
    cases := []struct {
        s    string
        want bool
    }{
        {"racecar", true}, {"hello", false}, {"", true}, {"a", true}, {"abba", true},
    }
    for _, c := range cases {
        if got := IsPalindrome(c.s); got != c.want {
            t.Errorf("IsPalindrome(%q) = %v, want %v", c.s, got, c.want)
        }
    }
}
`,
			hints: `["[]rune(s) для корректной работы с Unicode", "Два указателя: i с начала, j с конца"]`,
		},
		{
			order: 35, title: "Анаграммы", difficulty: "easy", category: "Строки",
			description: "Напиши функцию IsAnagram(a, b string) bool — возвращает true если строки являются анаграммами (регистр не важен).",
			starterCode: `package main

import "strings"

func IsAnagram(a, b string) bool {
    // TODO
    return false
}
`,
			solutionCode: `package main

import "strings"

func IsAnagram(a, b string) bool {
    a = strings.ToLower(a)
    b = strings.ToLower(b)
    if len(a) != len(b) {
        return false
    }
    counts := make(map[rune]int)
    for _, r := range a {
        counts[r]++
    }
    for _, r := range b {
        counts[r]--
        if counts[r] < 0 {
            return false
        }
    }
    return true
}
`,
			testCode: `package main

import "testing"

func TestIsAnagram(t *testing.T) {
    cases := []struct {
        a, b string
        want bool
    }{
        {"listen", "silent", true},
        {"Hello", "olleh", true},
        {"rat", "car", false},
        {"", "", true},
        {"a", "b", false},
    }
    for _, c := range cases {
        if got := IsAnagram(c.a, c.b); got != c.want {
            t.Errorf("IsAnagram(%q,%q) = %v, want %v", c.a, c.b, got, c.want)
        }
    }
}
`,
			hints: `["strings.ToLower сначала", "Подсчитай символы в map, потом декрементируй"]`,
		},
		{
			order: 36, title: "Разворот слов в предложении", difficulty: "easy", category: "Строки",
			description: "Напиши функцию ReverseWords(s string) string — переставляет слова в обратном порядке (\"hello world\" → \"world hello\").",
			starterCode: `package main

import "strings"

func ReverseWords(s string) string {
    // TODO
    return ""
}
`,
			solutionCode: `package main

import "strings"

func ReverseWords(s string) string {
    words := strings.Fields(s)
    for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
        words[i], words[j] = words[j], words[i]
    }
    return strings.Join(words, " ")
}
`,
			testCode: `package main

import "testing"

func TestReverseWords(t *testing.T) {
    cases := []struct{ input, want string }{
        {"hello world", "world hello"},
        {"one two three", "three two one"},
        {"single", "single"},
        {"", ""},
    }
    for _, c := range cases {
        got := ReverseWords(c.input)
        if got != c.want {
            t.Errorf("ReverseWords(%q) = %q, want %q", c.input, got, c.want)
        }
    }
}
`,
			hints: `["strings.Fields для разбивки", "strings.Join для сборки обратно"]`,
		},
		{
			order: 37, title: "Шифр Цезаря", difficulty: "medium", category: "Строки",
			description: "Напиши функцию Caesar(s string, shift int) string — шифрует латинские буквы (обёртка по алфавиту), остальные символы не трогает.",
			starterCode: `package main

func Caesar(s string, shift int) string {
    // TODO
    return ""
}
`,
			solutionCode: `package main

func Caesar(s string, shift int) string {
    result := []rune(s)
    shift = ((shift % 26) + 26) % 26
    for i, ch := range result {
        switch {
        case ch >= 'A' && ch <= 'Z':
            result[i] = 'A' + (ch-'A'+rune(shift))%26
        case ch >= 'a' && ch <= 'z':
            result[i] = 'a' + (ch-'a'+rune(shift))%26
        }
    }
    return string(result)
}
`,
			testCode: `package main

import "testing"

func TestCaesar(t *testing.T) {
    cases := []struct {
        s     string
        shift int
        want  string
    }{
        {"abc", 3, "def"},
        {"xyz", 3, "abc"},
        {"Hello, World!", 13, "Uryyb, Jbeyq!"},
        {"abc", 0, "abc"},
        {"abc", -3, "xyz"},
    }
    for _, c := range cases {
        got := Caesar(c.s, c.shift)
        if got != c.want {
            t.Errorf("Caesar(%q, %d) = %q, want %q", c.s, c.shift, got, c.want)
        }
    }
}
`,
			hints: `["(shift % 26 + 26) % 26 для нормализации", "Отдельно обрабатывай верхний и нижний регистр"]`,
		},
		{
			order: 38, title: "Подсчёт скобок", difficulty: "medium", category: "Строки",
			description: "Напиши функцию IsBalanced(s string) bool — возвращает true если скобки (,),[,],{,} в строке сбалансированы.",
			starterCode: `package main

func IsBalanced(s string) bool {
    // TODO
    return false
}
`,
			solutionCode: `package main

func IsBalanced(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
    for _, ch := range s {
        switch ch {
        case '(', '[', '{':
            stack = append(stack, ch)
        case ')', ']', '}':
            if len(stack) == 0 || stack[len(stack)-1] != pairs[ch] {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}
`,
			testCode: `package main

import "testing"

func TestIsBalanced(t *testing.T) {
    cases := []struct {
        s    string
        want bool
    }{
        {"()", true}, {"()[]{}", true}, {"(]", false}, {"([)]", false},
        {"{[]}", true}, {"", true}, {"((", false},
    }
    for _, c := range cases {
        if got := IsBalanced(c.s); got != c.want {
            t.Errorf("IsBalanced(%q) = %v, want %v", c.s, got, c.want)
        }
    }
}
`,
			hints: `["Стек []rune", "Открывающие — push, закрывающие — проверь top и pop"]`,
		},
		// ── Конкурентность ──────────────────────────────────────────
		{
			order: 39, title: "Параллельный сбор результатов", difficulty: "medium", category: "Конкурентность",
			description: "Напиши функцию ParallelSquares(nums []int) []int — возвращает слайс квадратов, вычисленных параллельно. Порядок должен совпадать с входным.",
			starterCode: `package main

func ParallelSquares(nums []int) []int {
    // TODO: используй goroutines
    return nil
}
`,
			solutionCode: `package main

import "sync"

func ParallelSquares(nums []int) []int {
    result := make([]int, len(nums))
    var wg sync.WaitGroup
    for i, n := range nums {
        wg.Add(1)
        go func(idx, val int) {
            defer wg.Done()
            result[idx] = val * val
        }(i, n)
    }
    wg.Wait()
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestParallelSquares(t *testing.T) {
    got := ParallelSquares([]int{1, 2, 3, 4, 5})
    want := []int{1, 4, 9, 16, 25}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("ParallelSquares = %v, want %v", got, want)
    }
    if len(ParallelSquares([]int{})) != 0 {
        t.Error("empty should return empty")
    }
}
`,
			hints: `["result := make([]int, len(nums)) заранее", "go func(idx, val int) — передавай i и n как параметры"]`,
		},
		{
			order: 40, title: "Pipeline через каналы", difficulty: "medium", category: "Конкурентность",
			description: "Напиши функцию Pipeline(nums []int) []int. Создай pipeline: generate → double → filter(>5) через goroutines и каналы.",
			starterCode: `package main

func Pipeline(nums []int) []int {
    // TODO: generate -> double -> filter(>5)
    return nil
}
`,
			solutionCode: `package main

func Pipeline(nums []int) []int {
    // stage 1: generate
    gen := make(chan int)
    go func() {
        for _, n := range nums {
            gen <- n
        }
        close(gen)
    }()

    // stage 2: double
    doubled := make(chan int)
    go func() {
        for n := range gen {
            doubled <- n * 2
        }
        close(doubled)
    }()

    // stage 3: filter >5
    result := []int{}
    for n := range doubled {
        if n > 5 {
            result = append(result, n)
        }
    }
    return result
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestPipeline(t *testing.T) {
    got := Pipeline([]int{1, 2, 3, 4, 5})
    want := []int{6, 8, 10}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("Pipeline = %v, want %v", got, want)
    }
    if len(Pipeline([]int{})) != 0 {
        t.Error("empty input should give empty output")
    }
}
`,
			hints: `["Каждый stage — отдельная goroutine с каналом", "close(ch) в конце goroutine — для корректного range"]`,
		},
		{
			order: 41, title: "Fan-out / Fan-in", difficulty: "hard", category: "Конкурентность",
			description: "Напиши функцию FanOutIn(nums []int, workers int) []int — каждый воркер возводит число в квадрат. Возврати все результаты (порядок не важен).",
			starterCode: `package main

func FanOutIn(nums []int, workers int) []int {
    // TODO
    return nil
}
`,
			solutionCode: `package main

import (
    "sort"
    "sync"
)

func FanOutIn(nums []int, workers int) []int {
    jobs := make(chan int, len(nums))
    results := make(chan int, len(nums))

    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for n := range jobs {
                results <- n * n
            }
        }()
    }

    for _, n := range nums {
        jobs <- n
    }
    close(jobs)

    wg.Wait()
    close(results)

    out := []int{}
    for r := range results {
        out = append(out, r)
    }
    sort.Ints(out)
    return out
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestFanOutIn(t *testing.T) {
    got := FanOutIn([]int{1, 2, 3, 4, 5}, 3)
    want := []int{1, 4, 9, 16, 25}
    if !reflect.DeepEqual(got, want) {
        t.Errorf("FanOutIn = %v, want %v", got, want)
    }
}
`,
			hints: `["Буферизованный канал jobs", "wg.Wait() затем close(results)"]`,
		},
		// ── Алгоритмы ────────────────────────────────────────────────
		{
			order: 42, title: "Бинарный поиск", difficulty: "easy", category: "Алгоритмы",
			description: "Напиши функцию BinarySearch(arr []int, target int) int — возвращает индекс target в отсортированном arr, или -1 если не найден.",
			starterCode: `package main

func BinarySearch(arr []int, target int) int {
    // TODO
    return -1
}
`,
			solutionCode: `package main

func BinarySearch(arr []int, target int) int {
    lo, hi := 0, len(arr)-1
    for lo <= hi {
        mid := (lo + hi) / 2
        switch {
        case arr[mid] == target:
            return mid
        case arr[mid] < target:
            lo = mid + 1
        default:
            hi = mid - 1
        }
    }
    return -1
}
`,
			testCode: `package main

import "testing"

func TestBinarySearch(t *testing.T) {
    arr := []int{1, 3, 5, 7, 9, 11}
    cases := []struct{ target, want int }{
        {7, 3}, {1, 0}, {11, 5}, {4, -1}, {0, -1},
    }
    for _, c := range cases {
        got := BinarySearch(arr, c.target)
        if got != c.want {
            t.Errorf("BinarySearch(%d) = %d, want %d", c.target, got, c.want)
        }
    }
}
`,
			hints: `["lo, hi := 0, len(arr)-1", "mid := (lo + hi) / 2"]`,
		},
		{
			order: 43, title: "Числа Фибоначчи", difficulty: "easy", category: "Алгоритмы",
			description: "Напиши функцию Fibonacci(n int) int, которая возвращает n-е число Фибоначчи (F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)). Итеративно.",
			starterCode: `package main

func Fibonacci(n int) int {
    // TODO: итеративно, не рекурсивно
    return 0
}
`,
			solutionCode: `package main

func Fibonacci(n int) int {
    if n <= 0 {
        return 0
    }
    if n == 1 {
        return 1
    }
    a, b := 0, 1
    for i := 2; i <= n; i++ {
        a, b = b, a+b
    }
    return b
}
`,
			testCode: `package main

import "testing"

func TestFibonacci(t *testing.T) {
    cases := []struct{ n, want int }{
        {0, 0}, {1, 1}, {2, 1}, {5, 5}, {10, 55}, {20, 6765},
    }
    for _, c := range cases {
        if got := Fibonacci(c.n); got != c.want {
            t.Errorf("Fibonacci(%d) = %d, want %d", c.n, got, c.want)
        }
    }
}
`,
			hints: `["a, b := 0, 1", "a, b = b, a+b в цикле"]`,
		},
		{
			order: 44, title: "Сортировка пузырьком", difficulty: "easy", category: "Алгоритмы",
			description: "Напиши функцию BubbleSort(arr []int) — сортирует слайс in-place по возрастанию.",
			starterCode: `package main

func BubbleSort(arr []int) {
    // TODO
}
`,
			solutionCode: `package main

func BubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-1-i; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped {
            break
        }
    }
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestBubbleSort(t *testing.T) {
    arr := []int{5, 3, 8, 1, 2}
    BubbleSort(arr)
    want := []int{1, 2, 3, 5, 8}
    if !reflect.DeepEqual(arr, want) {
        t.Errorf("BubbleSort = %v, want %v", arr, want)
    }
    single := []int{1}
    BubbleSort(single)
    if single[0] != 1 { t.Error("single element") }
}
`,
			hints: `["Два вложенных цикла", "Оптимизация: если не было обмена — уже отсортировано"]`,
		},
		{
			order: 45, title: "Максимальная сумма подмассива", difficulty: "medium", category: "Алгоритмы",
			description: "Напиши функцию MaxSubarraySum(arr []int) int — алгоритм Кадана: максимальная сумма непрерывного подмассива.",
			starterCode: `package main

func MaxSubarraySum(arr []int) int {
    // TODO: алгоритм Кадана
    return 0
}
`,
			solutionCode: `package main

func MaxSubarraySum(arr []int) int {
    if len(arr) == 0 {
        return 0
    }
    maxSum, current := arr[0], arr[0]
    for _, v := range arr[1:] {
        if current < 0 {
            current = v
        } else {
            current += v
        }
        if current > maxSum {
            maxSum = current
        }
    }
    return maxSum
}
`,
			testCode: `package main

import "testing"

func TestMaxSubarraySum(t *testing.T) {
    cases := []struct {
        arr  []int
        want int
    }{
        {[]int{-2, 1, -3, 4, -1, 2, 1, -5, 4}, 6},
        {[]int{1, 2, 3}, 6},
        {[]int{-1, -2, -3}, -1},
        {[]int{5}, 5},
    }
    for _, c := range cases {
        got := MaxSubarraySum(c.arr)
        if got != c.want {
            t.Errorf("MaxSubarraySum(%v) = %d, want %d", c.arr, got, c.want)
        }
    }
}
`,
			hints: `["current = max(v, current+v)", "Обновляй maxSum на каждом шаге"]`,
		},
		{
			order: 46, title: "Быстрая сортировка", difficulty: "hard", category: "Алгоритмы",
			description: "Напиши функцию QuickSort(arr []int) — сортирует слайс in-place.",
			starterCode: `package main

func QuickSort(arr []int) {
    // TODO
}
`,
			solutionCode: `package main

func QuickSort(arr []int) {
    quickSort(arr, 0, len(arr)-1)
}

func quickSort(arr []int, lo, hi int) {
    if lo < hi {
        p := partition(arr, lo, hi)
        quickSort(arr, lo, p-1)
        quickSort(arr, p+1, hi)
    }
}

func partition(arr []int, lo, hi int) int {
    pivot := arr[hi]
    i := lo
    for j := lo; j < hi; j++ {
        if arr[j] <= pivot {
            arr[i], arr[j] = arr[j], arr[i]
            i++
        }
    }
    arr[i], arr[hi] = arr[hi], arr[i]
    return i
}
`,
			testCode: `package main

import (
    "reflect"
    "testing"
)

func TestQuickSort(t *testing.T) {
    arr := []int{3, 6, 8, 10, 1, 2, 1}
    QuickSort(arr)
    want := []int{1, 1, 2, 3, 6, 8, 10}
    if !reflect.DeepEqual(arr, want) {
        t.Errorf("QuickSort = %v, want %v", arr, want)
    }
    empty := []int{}
    QuickSort(empty)
}
`,
			hints: `["Partition: выбери pivot = arr[hi]", "Рекурсия для левой и правой частей"]`,
		},
		{
			order: 47, title: "Глубина бинарного дерева", difficulty: "medium", category: "Алгоритмы",
			description: "Создай тип TreeNode{Val int; Left, Right *TreeNode} и функцию MaxDepth(root *TreeNode) int.",
			starterCode: `package main

type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func MaxDepth(root *TreeNode) int {
    // TODO
    return 0
}
`,
			solutionCode: `package main

type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func MaxDepth(root *TreeNode) int {
    if root == nil {
        return 0
    }
    l := MaxDepth(root.Left)
    r := MaxDepth(root.Right)
    if l > r {
        return l + 1
    }
    return r + 1
}
`,
			testCode: `package main

import "testing"

func TestMaxDepth(t *testing.T) {
    // Tree:    1
    //         / \
    //        2   3
    //       /
    //      4
    root := &TreeNode{1,
        &TreeNode{2, &TreeNode{4, nil, nil}, nil},
        &TreeNode{3, nil, nil},
    }
    if got := MaxDepth(root); got != 3 {
        t.Errorf("MaxDepth = %d, want 3", got)
    }
    if MaxDepth(nil) != 0 {
        t.Error("nil tree depth should be 0")
    }
    if MaxDepth(&TreeNode{}) != 1 {
        t.Error("single node depth should be 1")
    }
}
`,
			hints: `["Рекурсия: max(MaxDepth(left), MaxDepth(right)) + 1", "Базовый случай: nil → 0"]`,
		},
		// ── JSON / HTTP ──────────────────────────────────────────────
		{
			order: 48, title: "Сериализация JSON", difficulty: "easy", category: "JSON",
			description: "Напиши функцию ToJSON(v any) (string, error), которая сериализует v в JSON-строку.",
			starterCode: `package main

import "encoding/json"

func ToJSON(v any) (string, error) {
    // TODO
    return "", nil
}
`,
			solutionCode: `package main

import "encoding/json"

func ToJSON(v any) (string, error) {
    b, err := json.Marshal(v)
    if err != nil {
        return "", err
    }
    return string(b), nil
}
`,
			testCode: `package main

import (
    "encoding/json"
    "testing"
)

func TestToJSON(t *testing.T) {
    type Person struct {
        Name string ` + "`" + `json:"name"` + "`" + `
        Age  int    ` + "`" + `json:"age"` + "`" + `
    }
    s, err := ToJSON(Person{"Alice", 30})
    if err != nil {
        t.Fatal(err)
    }
    var p Person
    if err := json.Unmarshal([]byte(s), &p); err != nil {
        t.Fatalf("unmarshal: %v, json was: %s", err, s)
    }
    if p.Name != "Alice" || p.Age != 30 {
        t.Errorf("roundtrip failed: %+v", p)
    }
}
`,
			hints: `["json.Marshal возвращает []byte", "string(b) для конвертации"]`,
		},
		{
			order: 49, title: "Десериализация JSON", difficulty: "easy", category: "JSON",
			description: "Напиши функцию FromJSON(data string, v any) error, которая десериализует JSON из строки в переданный указатель.",
			starterCode: `package main

import "encoding/json"

func FromJSON(data string, v any) error {
    // TODO
    return nil
}
`,
			solutionCode: `package main

import "encoding/json"

func FromJSON(data string, v any) error {
    return json.Unmarshal([]byte(data), v)
}
`,
			testCode: `package main

import "testing"

func TestFromJSON(t *testing.T) {
    type Config struct {
        Host string ` + "`" + `json:"host"` + "`" + `
        Port int    ` + "`" + `json:"port"` + "`" + `
    }
    var cfg Config
    err := FromJSON(` + "`" + `{"host":"localhost","port":8080}` + "`" + `, &cfg)
    if err != nil {
        t.Fatal(err)
    }
    if cfg.Host != "localhost" || cfg.Port != 8080 {
        t.Errorf("got %+v", cfg)
    }
    if err := FromJSON("invalid", &cfg); err == nil {
        t.Error("invalid JSON should return error")
    }
}
`,
			hints: `["json.Unmarshal([]byte(data), v)", "v должен быть указателем (*struct)"]`,
		},
		{
			order: 50, title: "HTTP-хендлер: здоровье сервиса", difficulty: "medium", category: "HTTP",
			description: "Реализуй функцию HealthHandler(w http.ResponseWriter, r *http.Request), которая отправляет JSON {\"status\":\"ok\"} с кодом 200.",
			starterCode: `package main

import (
    "encoding/json"
    "net/http"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
    // TODO
}
`,
			solutionCode: `package main

import (
    "encoding/json"
    "net/http"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
`,
			testCode: `package main

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHealthHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    w := httptest.NewRecorder()
    HealthHandler(w, req)
    resp := w.Result()
    if resp.StatusCode != http.StatusOK {
        t.Errorf("status = %d, want 200", resp.StatusCode)
    }
    var body map[string]string
    json.NewDecoder(resp.Body).Decode(&body)
    if body["status"] != "ok" {
        t.Errorf("body[status] = %q, want ok", body["status"])
    }
}
`,
			hints: `["w.Header().Set(\"Content-Type\", \"application/json\")", "json.NewEncoder(w).Encode(...)"]`,
		},
	}

	result := make([]models.Exercise, 0, len(defs))
	for _, d := range defs {
		result = append(result, models.Exercise{
			Module:       module,
			Order:        d.order,
			Title:        d.title,
			Description:  d.description,
			Difficulty:   d.difficulty,
			Category:     d.category,
			StarterCode:  d.starterCode,
			SolutionCode: d.solutionCode,
			TestCode:     d.testCode,
			Hints:        d.hints,
		})
	}
	return result
}

func extraCoreLessons() []models.Lesson {
	return []models.Lesson{
		{
			Module: "core", Slug: "tooling-and-project-structure", Title: "Инструменты и структура проекта",
			Description: "go run, go build, go install, go mod, пакеты, импорты и naming conventions",
			Category:    "Инструменты", Order: 21,
			Content: `# Инструменты и структура проекта

Прежде чем писать серьёзный код, важно разобраться с инструментами, которые Go предоставляет из коробки.

---

## Основные команды

` + "```" + `bash
# Запустить программу (без сборки бинарника)
go run main.go

# Скомпилировать в бинарник
go build -o myapp .

# Собрать и установить в $GOPATH/bin
go install .

# Запустить тесты
go test ./...

# Скачать зависимости
go mod tidy
` + "```" + `

---

## go mod — управление зависимостями

Каждый Go-проект начинается с файла ` + "`go.mod`" + `. Он создаётся командой:

` + "```" + `bash
go mod init github.com/yourname/myproject
` + "```" + `

Файл выглядит так:

` + "```" + `go
module github.com/yourname/myproject

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
)
` + "```" + `

---

## Структура проекта

Вот стандартная структура Go-проекта:

` + "```" + `
myproject/
├── cmd/
│   └── server/
│       └── main.go       // точка входа
├── internal/
│   ├── handler/          // HTTP-хендлеры
│   ├── service/          // бизнес-логика
│   └── repository/       // работа с базой
├── pkg/                  // переиспользуемые пакеты
├── go.mod
└── go.sum
` + "```" + `

---

## Пакеты и импорты

` + "```" + `go
package main

import (
    "fmt"              // стандартная библиотека
    "math/rand"        // вложенный пакет

    "github.com/gin-gonic/gin"  // внешняя библиотека
)
` + "```" + `

---

## Naming Conventions

| Что | Стиль | Пример |
|-----|-------|--------|
| Переменные и функции | camelCase | ` + "`userName`" + ` |
| Экспортируемые | PascalCase | ` + "`UserName`" + ` |
| Пакеты | lowercase | ` + "`userservice`" + ` |
| Константы | camelCase (не UPPER_CASE) | ` + "`maxRetries`" + ` |
| Файлы | snake_case | ` + "`user_service.go`" + ` |

> В Go видимость определяется первой буквой: **заглавная** = публично, **строчная** = приватно.
`,
		},
		{
			Module: "core", Slug: "pointers", Title: "Указатели",
			Description: "Адреса памяти, * и &, передача по ссылке и когда использовать указатели",
			Category:    "Основы", Order: 22,
			Content: `# Указатели

Указатель — это переменная, которая хранит **адрес в памяти** другой переменной.

---

## * и &

` + "```" + `go
x := 42
p := &x   // p — указатель на x, тип *int

fmt.Println(p)   // 0xc0000b4010 (адрес)
fmt.Println(*p)  // 42 (разыменование — значение по адресу)

*p = 100
fmt.Println(x)   // 100 — x изменился!
` + "```" + `

---

## Передача по ссылке

Без указателя функция получает **копию** значения:

` + "```" + `go
func double(n int) {
    n = n * 2  // меняем копию, оригинал не трогаем
}

x := 5
double(x)
fmt.Println(x) // 5 — не изменилось!
` + "```" + `

С указателем:

` + "```" + `go
func double(n *int) {
    *n = *n * 2
}

x := 5
double(&x)
fmt.Println(x) // 10 — изменилось!
` + "```" + `

---

## Указатели в структурах

` + "```" + `go
type User struct {
    Name string
    Age  int
}

func birthday(u *User) {
    u.Age++  // Go автоматически разыменовывает: (*u).Age++
}

user := User{Name: "Алекс", Age: 25}
birthday(&user)
fmt.Println(user.Age) // 26
` + "```" + `

---

## Когда использовать указатели

1. **Большие структуры** — избегаем дорогого копирования
2. **Изменение значения** внутри функции
3. **Методы на структурах** — если метод должен менять поля
4. **nil-значения** — указатель может быть nil (опционально)

---

## new() и управление памятью

` + "```" + `go
p := new(int)  // выделяет память, возвращает *int со значением 0
*p = 42
fmt.Println(*p) // 42
` + "```" + `

> Go — язык со сборщиком мусора. Не нужно вручную освобождать память, как в C.
`,
		},
		{
			Module: "core", Slug: "files-and-io", Title: "Работа с файлами и io",
			Description: "os.Open, os.Create, чтение/запись, io.Reader/Writer, bufio",
			Category:    "Ввод/Вывод", Order: 23,
			Content: `# Работа с файлами и io

Go предоставляет мощные примитивы ввода/вывода через пакеты ` + "`os`" + `, ` + "`io`" + ` и ` + "`bufio`" + `.

---

## Чтение файла

` + "```" + `go
package main

import (
    "fmt"
    "os"
)

func main() {
    data, err := os.ReadFile("hello.txt")
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }
    fmt.Println(string(data))
}
` + "```" + `

---

## Запись файла

` + "```" + `go
err := os.WriteFile("output.txt", []byte("Привет, файл!"), 0644)
if err != nil {
    panic(err)
}
` + "```" + `

---

## Построчное чтение с bufio

` + "```" + `go
file, err := os.Open("data.txt")
if err != nil {
    panic(err)
}
defer file.Close()

scanner := bufio.NewScanner(file)
for scanner.Scan() {
    fmt.Println(scanner.Text())
}
` + "```" + `

---

## io.Reader и io.Writer

Это ключевые интерфейсы в Go — большинство функций работают через них:

` + "```" + `go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}
` + "```" + `

Это позволяет писать универсальный код:

` + "```" + `go
func copyData(dst io.Writer, src io.Reader) error {
    _, err := io.Copy(dst, src)
    return err
}
// Работает с файлами, HTTP, буферами — с чем угодно!
` + "```" + `

---

## Буферизированная запись

` + "```" + `go
file, _ := os.Create("large.txt")
defer file.Close()

writer := bufio.NewWriter(file)
fmt.Fprintln(writer, "Строка 1")
fmt.Fprintln(writer, "Строка 2")
writer.Flush() // Не забывай сбросить буфер!
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "json-and-serialization", Title: "JSON и сериализация",
			Description: "encoding/json, Marshal/Unmarshal, теги структур, работа с API-ответами",
			Category:    "Стандартная библиотека", Order: 24,
			Content: `# JSON и сериализация

Пакет ` + "`encoding/json`" + ` — один из самых используемых в Go-бэкенде.

---

## Теги в структурах

` + "```" + `go
type User struct {
    ID        int    ` + "`json:\"id\"`" + `
    Username  string ` + "`json:\"username\"`" + `
    Password  string ` + "`json:\"-\"`" + `           // игнорировать при сериализации
    CreatedAt string ` + "`json:\"created_at,omitempty\"`" + ` // пропустить если пусто
}
` + "```" + `

---

## Marshal — Go → JSON

` + "```" + `go
user := User{ID: 1, Username: "gopher"}

data, err := json.Marshal(user)
if err != nil {
    panic(err)
}
fmt.Println(string(data))
// {"id":1,"username":"gopher"}
` + "```" + `

## Unmarshal — JSON → Go

` + "```" + `go
jsonStr := ` + "`" + `{"id":1,"username":"gopher"}` + "`" + `

var user User
err := json.Unmarshal([]byte(jsonStr), &user)
if err != nil {
    panic(err)
}
fmt.Println(user.Username) // gopher
` + "```" + `

---

## Encoder/Decoder — для потоков

` + "```" + `go
// Чтение из HTTP-запроса
func handler(w http.ResponseWriter, r *http.Request) {
    var user User
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        http.Error(w, "Bad request", 400)
        return
    }

    // Ответ в JSON
    json.NewEncoder(w).Encode(user)
}
` + "```" + `

---

## Работа с произвольным JSON

Когда структура неизвестна заранее:

` + "```" + `go
var result map[string]interface{}
json.Unmarshal(data, &result)

// Или через []interface{} для массивов
var items []map[string]interface{}
json.Unmarshal(data, &items)
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "http-server", Title: "HTTP серверы",
			Description: "net/http, создание сервера, handlers, запросы и ответы, middleware",
			Category:    "Веб-разработка", Order: 25,
			Content: `# HTTP серверы

Go имеет отличную стандартную библиотеку для HTTP — ` + "`net/http`" + `.

---

## Минимальный сервер

` + "```" + `go
package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Привет, мир!")
}

func main() {
    http.HandleFunc("/", helloHandler)
    http.ListenAndServe(":8080", nil)
}
` + "```" + `

---

## Методы запроса

` + "```" + `go
func handler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        fmt.Fprintln(w, "GET-запрос")
    case http.MethodPost:
        fmt.Fprintln(w, "POST-запрос")
    default:
        http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
    }
}
` + "```" + `

---

## Ответ в JSON

` + "```" + `go
func usersHandler(w http.ResponseWriter, r *http.Request) {
    users := []User{{ID: 1, Name: "Алекс"}}
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}
` + "```" + `

---

## Middleware

Middleware — функции, которые оборачивают хендлер:

` + "```" + `go
func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s %s", r.Method, r.URL.Path)
        next(w, r)
    }
}

// Применение
http.HandleFunc("/api/users", loggingMiddleware(usersHandler))
` + "```" + `

---

## ServeMux — роутер

` + "```" + `go
mux := http.NewServeMux()
mux.HandleFunc("/", homeHandler)
mux.HandleFunc("/api/users", usersHandler)
mux.HandleFunc("/api/users/", userByIDHandler)

server := &http.Server{
    Addr:    ":8080",
    Handler: mux,
}
server.ListenAndServe()
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "rest-api", Title: "REST API",
			Description: "Принципы REST, CRUD операции, валидация данных, обработка ошибок",
			Category:    "Веб-разработка", Order: 26,
			Content: `# REST API

REST — архитектурный стиль для создания веб-сервисов.

---

## Принципы REST

| Метод | Действие | Пример |
|-------|----------|--------|
| GET | Получить | ` + "`GET /api/users`" + ` |
| POST | Создать | ` + "`POST /api/users`" + ` |
| PUT | Заменить | ` + "`PUT /api/users/1`" + ` |
| PATCH | Обновить частично | ` + "`PATCH /api/users/1`" + ` |
| DELETE | Удалить | ` + "`DELETE /api/users/1`" + ` |

---

## Полный CRUD на Gin

` + "```" + `go
package main

import (
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
)

type User struct {
    ID   int    ` + "`json:\"id\"`" + `
    Name string ` + "`json:\"name\" binding:\"required\"`" + `
}

var users = []User{}

func main() {
    r := gin.Default()

    r.GET("/api/users", func(c *gin.Context) {
        c.JSON(http.StatusOK, users)
    })

    r.POST("/api/users", func(c *gin.Context) {
        var user User
        if err := c.ShouldBindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
        user.ID = len(users) + 1
        users = append(users, user)
        c.JSON(http.StatusCreated, user)
    })

    r.DELETE("/api/users/:id", func(c *gin.Context) {
        id, _ := strconv.Atoi(c.Param("id"))
        for i, u := range users {
            if u.ID == id {
                users = append(users[:i], users[i+1:]...)
                c.JSON(http.StatusOK, gin.H{"ok": true})
                return
            }
        }
        c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
    })

    r.Run(":8080")
}
` + "```" + `

---

## Валидация данных

` + "```" + `go
type CreateUserRequest struct {
    Name  string ` + "`json:\"name\" binding:\"required,min=2,max=50\"`" + `
    Email string ` + "`json:\"email\" binding:\"required,email\"`" + `
    Age   int    ` + "`json:\"age\" binding:\"required,min=18,max=120\"`" + `
}
` + "```" + `

---

## HTTP-статусы

` + "```" + `go
c.JSON(http.StatusOK, ...)           // 200
c.JSON(http.StatusCreated, ...)      // 201
c.JSON(http.StatusBadRequest, ...)   // 400
c.JSON(http.StatusUnauthorized, ...) // 401
c.JSON(http.StatusNotFound, ...)     // 404
c.JSON(http.StatusInternalServerError, ...) // 500
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "databases", Title: "Работа с базами данных",
			Description: "database/sql, подключение к БД, CRUD, транзакции, GORM",
			Category:    "Базы данных", Order: 27,
			Content: `# Работа с базами данных

Go предоставляет пакет ` + "`database/sql`" + ` как стандартный интерфейс для работы с реляционными БД.

---

## Подключение

` + "```" + `go
import (
    "database/sql"
    _ "github.com/lib/pq"  // драйвер PostgreSQL
)

db, err := sql.Open("postgres", "host=localhost user=go password=go dbname=mydb sslmode=disable")
if err != nil {
    panic(err)
}
defer db.Close()

// Проверить соединение
if err = db.Ping(); err != nil {
    panic(err)
}
` + "```" + `

---

## CRUD операции

` + "```" + `go
// CREATE
res, err := db.Exec("INSERT INTO users(name, email) VALUES($1, $2)", "Алекс", "alex@example.com")
id, _ := res.LastInsertId()

// READ
rows, err := db.Query("SELECT id, name FROM users WHERE active = $1", true)
defer rows.Close()
for rows.Next() {
    var id int
    var name string
    rows.Scan(&id, &name)
    fmt.Println(id, name)
}

// UPDATE
db.Exec("UPDATE users SET name = $1 WHERE id = $2", "Новое имя", 1)

// DELETE
db.Exec("DELETE FROM users WHERE id = $1", 1)
` + "```" + `

---

## Транзакции

` + "```" + `go
tx, err := db.Begin()
if err != nil {
    return err
}
defer tx.Rollback() // Откат если что-то пошло не так

tx.Exec("UPDATE accounts SET balance = balance - 100 WHERE id = $1", fromID)
tx.Exec("UPDATE accounts SET balance = balance + 100 WHERE id = $1", toID)

return tx.Commit()
` + "```" + `

---

## GORM — популярный ORM

` + "```" + `go
import "gorm.io/gorm"

type User struct {
    gorm.Model
    Name  string
    Email string ` + "`gorm:\"uniqueIndex\"`" + `
}

// Автомиграция
db.AutoMigrate(&User{})

// Создать
db.Create(&User{Name: "Алекс", Email: "alex@example.com"})

// Найти
var user User
db.First(&user, 1)          // по ID
db.Where("name = ?", "Алекс").First(&user)

// Обновить
db.Save(&user)

// Удалить (soft delete)
db.Delete(&user, 1)
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "channels", Title: "Каналы",
			Description: "Создание, отправка/получение, буферизированные каналы, закрытие, select",
			Category:    "Конкурентность", Order: 28,
			Content: `# Каналы

Каналы — основной механизм коммуникации между горутинами в Go.

> "Не общайтесь через разделяемую память — разделяйте память через общение" — Rob Pike

---

## Создание и использование

` + "```" + `go
ch := make(chan int)      // небуферизированный канал
bch := make(chan int, 10) // буферизированный (буфер 10)
` + "```" + `

` + "```" + `go
// Отправка и получение
go func() {
    ch <- 42  // отправить в канал (блокирует, пока кто-то не получит)
}()

value := <-ch  // получить из канала (блокирует, пока не придёт значение)
fmt.Println(value) // 42
` + "```" + `

---

## Буферизированные каналы

` + "```" + `go
ch := make(chan string, 3)

ch <- "первый"  // не блокирует, буфер не полон
ch <- "второй"
ch <- "третий"
// ch <- "четвёртый"  // заблокирует — буфер заполнен!

fmt.Println(<-ch) // первый
fmt.Println(<-ch) // второй
` + "```" + `

---

## Закрытие канала

` + "```" + `go
ch := make(chan int, 5)
for i := 0; i < 5; i++ {
    ch <- i
}
close(ch)

for v := range ch {  // автоматически завершится при закрытии
    fmt.Println(v)
}
` + "```" + `

---

## select — мультиплексирование

` + "```" + `go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() { time.Sleep(1 * time.Second); ch1 <- "один" }()
    go func() { time.Sleep(2 * time.Second); ch2 <- "два" }()

    for i := 0; i < 2; i++ {
        select {
        case msg := <-ch1:
            fmt.Println("ch1:", msg)
        case msg := <-ch2:
            fmt.Println("ch2:", msg)
        }
    }
}
` + "```" + `

---

## select с таймаутом

` + "```" + `go
select {
case result := <-ch:
    fmt.Println("Получено:", result)
case <-time.After(3 * time.Second):
    fmt.Println("Таймаут!")
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "concurrency-patterns", Title: "Паттерны конкурентности",
			Description: "select, sync.WaitGroup, Worker Pool, Fan-in/Fan-out",
			Category:    "Конкурентность", Order: 29,
			Content: `# Паттерны конкурентности

Go отлично подходит для написания конкурентных программ. Изучим основные паттерны.

---

## sync.WaitGroup — ждём несколько горутин

` + "```" + `go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        fmt.Printf("Горутина %d завершена\n", id)
    }(i)
}

wg.Wait() // ждём все горутины
fmt.Println("Всё готово!")
` + "```" + `

---

## Worker Pool — пул воркеров

` + "```" + `go
func workerPool(jobs <-chan int, results chan<- int, numWorkers int) {
    var wg sync.WaitGroup
    
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- job * job  // обрабатываем задачу
            }
        }()
    }
    
    go func() {
        wg.Wait()
        close(results)
    }()
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    workerPool(jobs, results, 5) // 5 воркеров
    
    for i := 1; i <= 20; i++ {
        jobs <- i
    }
    close(jobs)
    
    for r := range results {
        fmt.Println(r)
    }
}
` + "```" + `

---

## Fan-out / Fan-in

` + "```" + `go
// Fan-out: рассылаем задачи в несколько каналов
func fanOut(input <-chan int, n int) []<-chan int {
    channels := make([]<-chan int, n)
    for i := 0; i < n; i++ {
        ch := make(chan int)
        channels[i] = ch
        go func(out chan<- int) {
            for v := range input {
                out <- v
            }
            close(out)
        }(ch)
    }
    return channels
}

// Fan-in: собираем из нескольких каналов в один
func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
` + "```" + `

---

## sync.Mutex — защита данных

` + "```" + `go
type SafeCounter struct {
    mu sync.Mutex
    v  map[string]int
}

func (c *SafeCounter) Inc(key string) {
    c.mu.Lock()
    c.v[key]++
    c.mu.Unlock()
}

func (c *SafeCounter) Value(key string) int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.v[key]
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "context", Title: "Context",
			Description: "Что такое context, отмена операций, таймауты, передача контекста",
			Category:    "Конкурентность", Order: 30,
			Content: `# Context

` + "`context.Context`" + ` — стандартный способ передавать сигналы отмены, дедлайны и значения через цепочку вызовов.

---

## Зачем нужен Context

Представь: пользователь отменил HTTP-запрос. Без контекста сервер продолжит работу, делать запросы к БД, тратить ресурсы. С контекстом — мгновенно остановится.

---

## Основные виды

` + "```" + `go
// Корневой контекст (никогда не отменяется)
ctx := context.Background()

// Отмена вручную
ctx, cancel := context.WithCancel(context.Background())
defer cancel() // всегда вызывай cancel!

// Таймаут
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// Дедлайн
deadline := time.Now().Add(10 * time.Second)
ctx, cancel := context.WithDeadline(context.Background(), deadline)
defer cancel()
` + "```" + `

---

## Отмена операции

` + "```" + `go
func longOperation(ctx context.Context) error {
    select {
    case <-time.After(10 * time.Second):
        return nil // завершили успешно
    case <-ctx.Done():
        return ctx.Err() // context.Canceled или context.DeadlineExceeded
    }
}

ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

err := longOperation(ctx)
if err != nil {
    fmt.Println("Ошибка:", err) // context deadline exceeded
}
` + "```" + `

---

## Context в HTTP-хендлерах

` + "```" + `go
func handler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context() // контекст HTTP-запроса
    
    result, err := db.QueryContext(ctx, "SELECT * FROM users")
    // Если клиент отключился — запрос к БД автоматически отменится
}
` + "```" + `

---

## Передача значений

` + "```" + `go
type contextKey string

const userIDKey contextKey = "userID"

// Записать
ctx := context.WithValue(r.Context(), userIDKey, 42)

// Прочитать
userID, ok := ctx.Value(userIDKey).(int)
` + "```" + `

> Используй ` + "`context.WithValue`" + ` только для метаданных запроса (user ID, request ID). Не передавай через контекст бизнес-параметры.
`,
		},
		{
			Module: "core", Slug: "logging", Title: "Логирование",
			Description: "Стандартный log, structured logging, slog, уровни логирования",
			Category:    "Эксплуатация", Order: 31,
			Content: `# Логирование

Хорошие логи — залог быстрой отладки в продакшене.

---

## Стандартный log

` + "```" + `go
import "log"

log.Println("Сервер запущен")        // 2026/01/15 10:30:00 Сервер запущен
log.Printf("Порт: %d", 8080)
log.Fatal("Ошибка:", err)           // выводит и вызывает os.Exit(1)
` + "```" + `

---

## Настройка формата

` + "```" + `go
log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
log.SetPrefix("[APP] ")

log.Println("Старт")
// [APP] 2026/01/15 10:30:00 main.go:12: Старт
` + "```" + `

---

## slog — structured logging (Go 1.21+)

Structured logging — логи в JSON для централизованной обработки и анализа:

` + "```" + `go
import "log/slog"

// Текстовый формат
logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

// JSON формат (для продакшена)
logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

logger.Info("запрос обработан",
    "method", "GET",
    "path", "/api/users",
    "status", 200,
    "duration_ms", 45,
)
// {"time":"2026-01-15T10:30:00Z","level":"INFO","msg":"запрос обработан","method":"GET","path":"/api/users","status":200,"duration_ms":45}
` + "```" + `

---

## Уровни логирования

` + "```" + `go
slog.Debug("подробная отладка")  // в продакшене обычно выключен
slog.Info("событие")             // обычные события
slog.Warn("что-то странное")     // не ошибка, но стоит заметить
slog.Error("что-то сломалось")   // ошибки
` + "```" + `

---

## Logger с контекстом

` + "```" + `go
// Логгер с постоянными атрибутами
logger := slog.With(
    "service", "user-service",
    "version", "1.0.0",
)

logger.Info("старт сервиса")
// {"service":"user-service","version":"1.0.0","msg":"старт сервиса",...}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "configuration", Title: "Конфигурация приложения",
			Description: "Переменные окружения, .env файлы, JSON/YAML конфиги, best practices",
			Category:    "Эксплуатация", Order: 32,
			Content: `# Конфигурация приложения

Правильная работа с конфигурацией — признак production-ready кода.

---

## Переменные окружения

` + "```" + `go
import "os"

port := os.Getenv("PORT")
if port == "" {
    port = "8080" // значение по умолчанию
}

dbURL := os.Getenv("DATABASE_URL")
jwtSecret := os.Getenv("JWT_SECRET")
` + "```" + `

---

## .env файлы с godotenv

` + "```" + `bash
# .env
PORT=8080
DATABASE_URL=postgres://user:pass@localhost/mydb
JWT_SECRET=supersecret
DEBUG=true
` + "```" + `

` + "```" + `go
import "github.com/joho/godotenv"

func init() {
    _ = godotenv.Load() // загружаем .env, игнорируем ошибку в продакшене
}
` + "```" + `

---

## Паттерн Config struct

` + "```" + `go
type Config struct {
    Port        string
    DatabaseURL string
    JWTSecret   string
    Debug       bool
}

func LoadConfig() *Config {
    _ = godotenv.Load()
    
    return &Config{
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost/mydb"),
        JWTSecret:   getEnv("JWT_SECRET", "change-me-in-production"),
        Debug:       os.Getenv("DEBUG") == "true",
    }
}

func getEnv(key, defaultVal string) string {
    if val := os.Getenv(key); val != "" {
        return val
    }
    return defaultVal
}
` + "```" + `

---

## YAML конфиги

` + "```" + `yaml
# config.yaml
server:
  port: 8080
  timeout: 30s
database:
  url: postgres://localhost/mydb
  max_connections: 10
` + "```" + `

` + "```" + `go
import "gopkg.in/yaml.v3"

type Config struct {
    Server struct {
        Port    int    ` + "`yaml:\"port\"`" + `
        Timeout string ` + "`yaml:\"timeout\"`" + `
    } ` + "`yaml:\"server\"`" + `
}

data, _ := os.ReadFile("config.yaml")
var cfg Config
yaml.Unmarshal(data, &cfg)
` + "```" + `

---

## Безопасность конфигов

- Никогда не коммить ` + "`.env`" + ` в git
- Добавляй ` + "`.env`" + ` в ` + "`.gitignore`" + `
- Используй разные конфиги для dev/staging/production
- Секреты храни в Railway Variables, Vault или аналогах
`,
		},
		{
			Module: "core", Slug: "architecture", Title: "Архитектура проекта",
			Description: "Слои приложения, Handler/Service/Repository, Dependency Injection",
			Category:    "Архитектура", Order: 33,
			Content: `# Архитектура проекта

Хорошая архитектура делает код понятным, тестируемым и лёгким в поддержке.

---

## Трёхслойная архитектура

` + "```" + `
HTTP Request
    │
    ▼
┌─────────────┐
│   Handler   │  ← принимает запрос, отвечает JSON
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │  ← бизнес-логика
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │  ← работа с базой данных
└─────────────┘
` + "```" + `

---

## Repository — слой данных

` + "```" + `go
type UserRepository interface {
    Create(user *User) error
    FindByID(id uint) (*User, error)
    FindByEmail(email string) (*User, error)
    Update(user *User) error
    Delete(id uint) error
}

type userRepo struct {
    db *gorm.DB
}

func (r *userRepo) FindByID(id uint) (*User, error) {
    var user User
    err := r.db.First(&user, id).Error
    return &user, err
}
` + "```" + `

---

## Service — бизнес-логика

` + "```" + `go
type UserService struct {
    repo UserRepository
}

func (s *UserService) Register(email, password string) (*User, error) {
    // Проверяем что email не занят
    existing, _ := s.repo.FindByEmail(email)
    if existing != nil {
        return nil, errors.New("email already taken")
    }
    
    // Хэшируем пароль
    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return nil, err
    }
    
    user := &User{Email: email, Password: string(hash)}
    return user, s.repo.Create(user)
}
` + "```" + `

---

## Handler — HTTP слой

` + "```" + `go
type UserHandler struct {
    service *UserService
}

func (h *UserHandler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    user, err := h.service.Register(req.Email, req.Password)
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusCreated, user)
}
` + "```" + `

---

## Dependency Injection

Собираем всё вместе в ` + "`main.go`" + `:

` + "```" + `go
func main() {
    db := database.Init(cfg.DatabaseURL)
    
    // Создаём зависимости снизу вверх
    userRepo := repository.NewUserRepository(db)
    userService := service.NewUserService(userRepo)
    userHandler := handler.NewUserHandler(userService)
    
    r := gin.Default()
    r.POST("/api/register", userHandler.Register)
    r.Run(":8080")
}
` + "```" + `

Преимущества:
- **Тестируемость**: легко подменить репозиторий на мок
- **Независимость слоёв**: каждый слой не знает о деталях другого
- **Гибкость**: можно менять БД без правок бизнес-логики
`,
		},
		{
			Module: "core", Slug: "testing", Title: "Тестирование",
			Description: "Пакет testing, unit-тесты, табличные тесты, моки, покрытие кода",
			Category:    "Качество кода", Order: 34,
			Content: `# Тестирование

Go имеет встроенный фреймворк для тестирования — никаких дополнительных библиотек не нужно.

---

## Первый тест

` + "```" + `go
// math.go
package math

func Add(a, b int) int {
    return a + b
}
` + "```" + `

` + "```" + `go
// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d, хотели 5", result)
    }
}
` + "```" + `

` + "```" + `bash
go test ./...
go test -v ./...  # с деталями
` + "```" + `

---

## Табличные тесты

` + "```" + `go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"положительные", 2, 3, 5},
        {"отрицательные", -1, -2, -3},
        {"ноль", 0, 5, 5},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d, хотели %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
` + "```" + `

---

## Моки через интерфейсы

` + "```" + `go
type UserRepository interface {
    FindByID(id uint) (*User, error)
}

// Мок для тестов
type mockUserRepo struct {
    users map[uint]*User
}

func (m *mockUserRepo) FindByID(id uint) (*User, error) {
    user, ok := m.users[id]
    if !ok {
        return nil, errors.New("not found")
    }
    return user, nil
}

func TestGetUser(t *testing.T) {
    repo := &mockUserRepo{
        users: map[uint]*User{1: {ID: 1, Name: "Алекс"}},
    }
    service := NewUserService(repo)
    
    user, err := service.GetUser(1)
    if err != nil || user.Name != "Алекс" {
        t.Fail()
    }
}
` + "```" + `

---

## Покрытие кода

` + "```" + `bash
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out  # открыть в браузере
` + "```" + `

---

## testify — популярная библиотека

` + "```" + `go
import "github.com/stretchr/testify/assert"

func TestAdd(t *testing.T) {
    assert.Equal(t, 5, Add(2, 3))
    assert.NotNil(t, user)
    assert.NoError(t, err)
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "profiling-and-optimization", Title: "Профилирование и оптимизация",
			Description: "Бенчмарки, pprof, анализ производительности, утечки памяти",
			Category:    "Качество кода", Order: 35,
			Content: `# Профилирование и оптимизация

Преждевременная оптимизация — зло. Сначала измерь, потом оптимизируй.

---

## Бенчмарки

` + "```" + `go
// Файл должен называться *_test.go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(2, 3)  // Go сам подберёт нужное количество итераций
    }
}
` + "```" + `

` + "```" + `bash
go test -bench=.            # запустить все бенчмарки
go test -bench=BenchmarkAdd # конкретный бенчмарк
go test -bench=. -benchmem  # с информацией об аллокациях памяти
` + "```" + `

Пример вывода:
` + "```" + `
BenchmarkAdd-8    1000000000    0.3 ns/op    0 B/op    0 allocs/op
` + "```" + `

---

## pprof — профилировщик

` + "```" + `go
import _ "net/http/pprof"

func main() {
    // Добавляем pprof эндпоинт
    go http.ListenAndServe("localhost:6060", nil)
    
    // ...основной код
}
` + "```" + `

` + "```" + `bash
# CPU профиль на 30 секунд
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# Профиль памяти
go tool pprof http://localhost:6060/debug/pprof/heap

# Внутри pprof:
(pprof) top10     # топ 10 функций по нагрузке
(pprof) web       # граф в браузере
` + "```" + `

---

## Типичные проблемы производительности

**1. Лишние аллокации:**
` + "```" + `go
// Плохо: пересоздаём слайс в цикле
for i := 0; i < 1000; i++ {
    s := make([]int, 0)
    s = append(s, i)
}

// Хорошо: предаллоцируем
s := make([]int, 0, 1000)
for i := 0; i < 1000; i++ {
    s = append(s, i)
}
` + "```" + `

**2. String конкатенация в цикле:**
` + "```" + `go
// Плохо: O(n²)
result := ""
for _, s := range words {
    result += s
}

// Хорошо: O(n)
var b strings.Builder
for _, s := range words {
    b.WriteString(s)
}
result := b.String()
` + "```" + `

**3. sync.Pool для переиспользования объектов:**
` + "```" + `go
var bufPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func process() {
    buf := bufPool.Get().(*bytes.Buffer)
    defer bufPool.Put(buf)
    buf.Reset()
    // используем buf...
}
` + "```" + `
`,
		},
		{
			Module: "core", Slug: "final-project", Title: "Финальный проект",
			Description: "Проектирование API, реализация backend, подключение БД, логирование, Docker",
			Category:    "Финал", Order: 36,
			Content: `# Финальный проект

Пришло время применить всё, что ты изучил. Ты создашь **полноценный REST API** для Task Manager.

---

## Что будем строить

**Task Manager API** — сервис для управления задачами:

- Регистрация и авторизация пользователей (JWT)
- CRUD для задач с категориями и приоритетами
- Фильтрация и поиск задач
- Статистика по проекту
- Логирование и конфигурация
- Docker-контейнер

---

## Структура проекта

` + "```" + `
task-manager/
├── cmd/server/main.go
├── internal/
│   ├── config/config.go
│   ├── handler/
│   │   ├── auth.go
│   │   └── task.go
│   ├── service/
│   │   ├── auth.go
│   │   └── task.go
│   ├── repository/
│   │   ├── user.go
│   │   └── task.go
│   └── models/
│       ├── user.go
│       └── task.go
├── Dockerfile
├── docker-compose.yml
└── go.mod
` + "```" + `

---

## Модели

` + "```" + `go
type Task struct {
    gorm.Model
    Title       string    ` + "`json:\"title\"`" + `
    Description string    ` + "`json:\"description\"`" + `
    Priority    string    ` + "`json:\"priority\"`" + `  // low, medium, high
    Status      string    ` + "`json:\"status\"`" + `    // todo, in_progress, done
    DueDate     time.Time ` + "`json:\"due_date\"`" + `
    UserID      uint      ` + "`json:\"user_id\"`" + `
    User        User      ` + "`json:\"user,omitempty\"`" + `
}
` + "```" + `

---

## API эндпоинты

` + "```" + `
POST   /api/auth/register
POST   /api/auth/login

GET    /api/tasks              # список задач (с фильтрами)
POST   /api/tasks              # создать задачу
GET    /api/tasks/:id          # одна задача
PUT    /api/tasks/:id          # обновить
DELETE /api/tasks/:id          # удалить

GET    /api/stats              # статистика
GET    /api/health             # healthcheck
` + "```" + `

---

## Dockerfile

` + "```" + `dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
` + "```" + `

---

## Чеклист готовности

- [ ] Работает регистрация и JWT-авторизация
- [ ] CRUD для задач с валидацией
- [ ] Фильтрация по статусу и приоритету
- [ ] Логирование запросов (slog)
- [ ] Конфигурация через env переменные
- [ ] Unit-тесты для service слоя
- [ ] Docker-контейнер собирается и работает
- [ ] README с инструкцией по запуску

---

## Поздравляем! 🎉

Если ты дошёл до этого урока — ты уже не новичок. Ты знаешь:
- Синтаксис и идиомы Go
- Конкурентность с горутинами и каналами
- Создание REST API
- Работу с базой данных
- Тестирование и профилирование
- Архитектуру production-ready приложений

**Следующий шаг** — Portfolio: запуши проект на GitHub, задеплой на Railway, добавь в резюме.
`,
		},
	}
}
