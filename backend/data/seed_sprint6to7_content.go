package data

import (
	"golanger/backend/models"
	"gorm.io/gorm"
)

func SeedSprint6to7Content(db *gorm.DB) {
	lessons := map[string]string{
"6-1-project-requirements": `# Что будем делать: проект «Погода»

Добро пожаловать в шестой спринт курса Godemy! Мы подошли к важному рубежу — скоро вы напишете свой первый настоящий проект на Go. Но прежде чем писать код, давайте разберёмся, **что именно** мы будем строить и **зачем**.

## Описание проекта

Мы создадим **HTTP-сервер**, который принимает название города и возвращает текущую погоду в формате JSON. Сервер будет запрашивать данные у внешнего Weather API, кешировать результаты и запускаться в Docker-контейнере.

Вот что будет уметь наше приложение:

- Принимать HTTP-запросы вида ` + "`" + `/weather?city=Moscow` + "`" + `
- Обращаться к внешнему Weather API за реальными данными
- Кешировать ответы, чтобы не дёргать API на каждый запрос
- Возвращать JSON с температурой и описанием погоды
- Запускаться внутри Docker-контейнера

## Технологии

Для реализации проекта мы будем использовать:

| Технология | Зачем |
|---|---|
| ` + "`" + `net/http` + "`" + ` | HTTP-сервер и клиент |
| ` + "`" + `encoding/json` + "`" + ` | Работа с JSON |
| ` + "`" + `os.Getenv` + "`" + ` | Чтение переменных окружения |
| ` + "`" + `map` + "`" + ` + ` + "`" + `time.Time` + "`" + ` | Простой кеш с TTL |
| Docker | Контейнеризация приложения |

## Структура проекта

В итоге структура файлов будет выглядеть примерно так:

` + "```" + `
weather-app/
├── main.go
├── .env
├── Dockerfile
├── go.mod
└── go.sum
` + "```" + `

Файл ` + "`" + `main.go` + "`" + ` будет содержать всю логику: сервер, обработчик, HTTP-клиент для запросов к API и кеш.

## Внешний API

Мы будем использовать бесплатный Weather API. Для этого потребуется зарегистрироваться и получить API-ключ. Ключ мы сохраним в файле ` + "`" + `.env` + "`" + `, чтобы не хранить его прямо в коде.

Пример запроса к API:

` + "```bash" + `
curl "https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=Moscow"
` + "```" + `

Ответ приходит в формате JSON:

` + "```" + `json
{
  "location": {
    "name": "Moscow"
  },
  "current": {
    "temp_c": 15.0,
    "condition": {
      "text": "Partly cloudy"
    }
  }
}
` + "```" + `

## Пример работы нашего сервера

Когда проект будет готов, вы сможете сделать запрос:

` + "```bash" + `
curl "http://localhost:8080/weather?city=Moscow"
` + "```" + `

И получить ответ:

` + "```" + `json
{
  "city": "Moscow",
  "temperature": 15.0,
  "description": "Partly cloudy"
}
` + "```" + `

## Этапы разработки

Мы разобьём проект на три шага (три урока в спринте 7):

1. **Сервер-заглушка** — сервер возвращает фиксированный JSON без обращения к API
2. **Подключение API** — сервер делает реальные запросы к Weather API
3. **Кеш и Docker** — добавляем кеш и упаковываем в контейнер

Каждый шаг завершается коммитом в git. Это правильный подход к разработке: маленькие, рабочие шаги.

## Зачем всё это

Этот проект объединяет всё, что вы изучили в предыдущих спринтах: переменные, структуры, функции, горутины (пока не используем, но скоро), работу с пакетами. Плюс вы освоите новые навыки: HTTP, JSON, работу с внешними API, кеширование и Docker.

После завершения проекта у вас будет **реальное приложение**, которое можно показать на собеседовании или добавить в портфолио.

В следующих уроках этого спринта мы подробно разберём каждую технологию, которая понадобится для проекта. Начнём!`,

"6-2-simple-explanation": `# Схема работы: клиент, сервер, API

Прежде чем писать код, давайте разберёмся, **как работает наше приложение** на уровне архитектуры. Понимание схемы взаимодействия компонентов — ключ к успешной разработке.

## Три участника

В нашем проекте участвуют три стороны:

1. **Клиент** — тот, кто делает запрос (браузер, curl, другое приложение)
2. **Наш сервер** — Go-приложение, которое мы пишем
3. **Weather API** — внешний сервис с данными о погоде

Схема взаимодействия выглядит так:

` + "```" + `
Клиент  →  Наш сервер  →  Weather API
  ↑            ↓                ↓
  └────────────←────────────────┘
       JSON-ответ с погодой
` + "```" + `

Клиент отправляет запрос нашему серверу. Наш сервер обращается к Weather API, получает данные, обрабатывает их и отправляет клиенту красивый ответ.

## Зачем нужен прокси

Возникает вопрос: зачем нужен «наш сервер»? Почему клиент не может обратиться к Weather API напрямую?

Причин несколько:

**1. Безопасность API-ключа.** Внешний API требует ключ для доступа. Если клиент — это браузер, то ключ будет виден в JavaScript-коде. Любой сможет его украсть. Наш сервер хранит ключ на серверной стороне.

**2. Контроль.** Мы можем ограничить количество запросов, добавить авторизацию, логировать запросы — делать всё, что нужно.

**3. Трансформация данных.** Weather API возвращает огромный JSON с кучей полей. Наш сервер извлекает только нужные данные и отдаёт клиенту простой ответ.

**4. Кеширование.** Мы можем сохранять ответы и не делать повторные запросы к API. Это экономит лимиты и ускоряет работу.

## Зачем нужен кеш

Представьте: 100 пользователей за минуту спросили погоду в Москве. Без кеша — 100 запросов к Weather API. С кешем — один запрос, остальные 99 получат сохранённый ответ.

` + "```" + `
Клиент → Наш сервер → [Кеш есть?]
                         ├── Да → вернуть из кеша
                         └── Нет → запросить Weather API
                                   → сохранить в кеш
                                   → вернуть клиенту
` + "```" + `

Кеш хранит данные определённое время (TTL — Time To Live). Например, 10 минут. После этого данные считаются устаревшими, и сервер снова обращается к API.

## Пример на псевдокоде

Вот как будет выглядеть логика обработчика:

` + "```go" + `
func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")

    // Проверяем кеш
    if data, ok := cache.Get(city); ok {
        // Отдаём из кеша
        json.NewEncoder(w).Encode(data)
        return
    }

    // Запрашиваем Weather API
    resp := httpClient.Get(weatherAPIURL + city)

    // Сохраняем в кеш
    cache.Set(city, resp)

    // Отдаём клиенту
    json.NewEncoder(w).Encode(resp)
}
` + "```" + `

Это упрощённый код — мы опустили обработку ошибок и детали. Но логика именно такая.

## HTTP-методы

Наш сервер будет обрабатывать только GET-запросы. GET — это запрос на получение данных. Когда вы открываете страницу в браузере, браузер делает GET-запрос.

` + "```bash" + `
# GET-запрос с помощью curl
curl "http://localhost:8080/weather?city=London"
` + "```" + `

Параметр ` + "`" + `city` + "`" + ` передаётся в URL после знака ` + "`" + `?` + "`" + `. Это называется **query-параметр**.

## Формат ответа

Наш сервер всегда отвечает в формате JSON. JSON (JavaScript Object Notation) — это текстовый формат обмена данными. Он удобен и для людей, и для программ.

` + "```" + `json
{
  "city": "London",
  "temperature": 12.5,
  "description": "Cloudy"
}
` + "```" + `

Если что-то пошло не так, сервер вернёт ошибку:

` + "```" + `json
{
  "error": "city parameter is required"
}
` + "```" + `

## Итог

Теперь вы понимаете общую картину. Наш сервер — это **прокси** между клиентом и Weather API. Он обеспечивает безопасность, кеширование и удобный формат ответа. В следующем уроке мы начнём писать этот сервер с нуля — с пакета ` + "`" + `net/http` + "`" + `.`,

"6-3-net-http": `# Пакет net/http: создаём HTTP-сервер

Пакет ` + "`" + `net/http` + "`" + ` — один из самых мощных инструментов стандартной библиотеки Go. С его помощью можно создать полноценный HTTP-сервер буквально в несколько строк.

## Минимальный сервер

Самый простой сервер на Go:

` + "```go" + `
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Привет, мир!")
    })

    fmt.Println("Сервер запущен на порту 8080")
    http.ListenAndServe(":8080", nil)
}
` + "```" + `

Запустите программу и откройте в браузере ` + "`" + `http://localhost:8080` + "`" + `. Вы увидите текст «Привет, мир!».

Разберём по строкам:

- ` + "`" + `http.HandleFunc("/", ...)` + "`" + ` — регистрирует функцию-обработчик для пути ` + "`" + `/` + "`" + `
- ` + "`" + `http.ResponseWriter` + "`" + ` — через него мы пишем ответ клиенту
- ` + "`" + `*http.Request` + "`" + ` — содержит информацию о входящем запросе
- ` + "`" + `http.ListenAndServe(":8080", nil)` + "`" + ` — запускает сервер на порту 8080

## Несколько маршрутов

Можно зарегистрировать несколько обработчиков для разных путей:

` + "```go" + `
package main

import (
    "fmt"
    "net/http"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Главная страница")
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "О нас")
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        city = "неизвестный город"
    }
    fmt.Fprintf(w, "Погода в городе: %s", city)
}

func main() {
    http.HandleFunc("/", homeHandler)
    http.HandleFunc("/about", aboutHandler)
    http.HandleFunc("/weather", weatherHandler)

    fmt.Println("Сервер запущен на http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}
` + "```" + `

Обратите внимание на ` + "`" + `r.URL.Query().Get(\"city\")` + "`" + ` — так мы читаем query-параметр из URL. Для запроса ` + "`" + `/weather?city=Moscow` + "`" + ` вернётся ` + "`" + `\"Moscow\"` + "`" + `.

## ServeMux

Когда мы передаём ` + "`" + `nil` + "`" + ` вторым аргументом в ` + "`" + `ListenAndServe` + "`" + `, Go использует ` + "`" + `http.DefaultServeMux` + "`" + ` — глобальный маршрутизатор. Но лучше создавать свой:

` + "```go" + `
package main

import (
    "fmt"
    "net/http"
)

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Главная")
    })

    mux.HandleFunc("/weather", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Погода")
    })

    fmt.Println("Сервер запущен на http://localhost:8080")
    http.ListenAndServe(":8080", mux)
}
` + "```" + `

Зачем свой ` + "`" + `ServeMux` + "`" + `? Глобальный ` + "`" + `DefaultServeMux` + "`" + ` разделяется между всеми пакетами вашей программы. Если подключённая библиотека тоже регистрирует обработчики на ` + "`" + `DefaultServeMux` + "`" + `, могут возникнуть конфликты. Свой ` + "`" + `ServeMux` + "`" + ` — это изоляция и контроль.

## Коды ответов и заголовки

Сервер должен правильно сообщать клиенту о статусе ответа:

` + "```go" + `
func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        w.WriteHeader(http.StatusBadRequest) // 400
        fmt.Fprintf(w, "Параметр city обязателен")
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK) // 200
    fmt.Fprintf(w, ` + "`" + `{"city": "%s", "temp": 20}` + "`" + `, city)
}
` + "```" + `

Важные моменты:

- ` + "`" + `w.WriteHeader()` + "`" + ` устанавливает HTTP-код ответа
- ` + "`" + `w.Header().Set()` + "`" + ` устанавливает заголовки — вызывайте **до** ` + "`" + `WriteHeader` + "`" + `
- ` + "`" + `http.StatusBadRequest` + "`" + ` — константа для кода 400
- ` + "`" + `http.StatusOK` + "`" + ` — константа для кода 200

## Проверка с помощью curl

Запустите сервер и протестируйте:

` + "```bash" + `
# Запрос с параметром
curl "http://localhost:8080/weather?city=Moscow"

# Запрос без параметра — получим ошибку 400
curl -v "http://localhost:8080/weather"
` + "```" + `

Флаг ` + "`" + `-v` + "`" + ` (verbose) покажет заголовки ответа и код статуса.

## Обработка ошибки ListenAndServe

Функция ` + "`" + `ListenAndServe` + "`" + ` возвращает ошибку. Если порт уже занят, сервер не запустится. Всегда проверяйте ошибку:

` + "```go" + `
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "OK")
    })

    fmt.Println("Сервер запущен на http://localhost:8080")
    err := http.ListenAndServe(":8080", mux)
    if err != nil {
        fmt.Println("Ошибка запуска сервера:", err)
    }
}
` + "```" + `

Часто используют ` + "`" + `log.Fatal` + "`" + `:

` + "```go" + `
log.Fatal(http.ListenAndServe(":8080", mux))
` + "```" + `

Это напечатает ошибку и завершит программу с кодом 1.

## Итог

Вы научились создавать HTTP-сервер с помощью пакета ` + "`" + `net/http` + "`" + `. Ключевые функции: ` + "`" + `HandleFunc` + "`" + ` для регистрации обработчиков, ` + "`" + `ListenAndServe` + "`" + ` для запуска, ` + "`" + `ResponseWriter` + "`" + ` для ответов и ` + "`" + `Request` + "`" + ` для чтения запросов. В следующем уроке разберём работу с JSON.`,

"6-4-json": `# Работа с JSON в Go: encoding/json

JSON — основной формат обмена данными в веб-разработке. В Go для работы с JSON используется пакет ` + "`" + `encoding/json` + "`" + `.

## Marshal: структура → JSON

Функция ` + "`" + `json.Marshal` + "`" + ` превращает Go-значение в JSON-байты:

` + "```go" + `
package main

import (
    "encoding/json"
    "fmt"
)

type Weather struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}

func main() {
    w := Weather{
        City:        "Moscow",
        Temperature: 15.5,
        Description: "Облачно",
    }

    data, err := json.Marshal(w)
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }

    fmt.Println(string(data))
    // {"city":"Moscow","temperature":15.5,"description":"Облачно"}
}
` + "```" + `

## Теги структур

Обратите внимание на теги после типа поля:

` + "```go" + `
type Weather struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}
` + "```" + `

Тег ` + "`" + `json:\"city\"` + "`" + ` говорит: «в JSON это поле называется ` + "`" + `city` + "`" + `». Без тега Go использует имя поля как есть (` + "`" + `City` + "`" + ` с большой буквы), а это не принято в JSON.

Полезные варианты тегов:

` + "```go" + `
type User struct {
    Name     string ` + "`" + `json:"name"` + "`" + `           // поле "name" в JSON
    Age      int    ` + "`" + `json:"age,omitempty"` + "`" + `  // пропустить, если 0
    Password string ` + "`" + `json:"-"` + "`" + `              // никогда не включать
}
` + "```" + `

- ` + "`" + `omitempty` + "`" + ` — поле не попадёт в JSON, если оно пустое (0, "", nil, false)
- ` + "`" + `\"-\"` + "`" + ` — поле полностью игнорируется при сериализации

## Unmarshal: JSON → структура

Функция ` + "`" + `json.Unmarshal` + "`" + ` делает обратное — парсит JSON в Go-структуру:

` + "```go" + `
package main

import (
    "encoding/json"
    "fmt"
)

type Weather struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}

func main() {
    jsonStr := ` + "`" + `{"city":"London","temperature":12.3,"description":"Rain"}` + "`" + `

    var w Weather
    err := json.Unmarshal([]byte(jsonStr), &w)
    if err != nil {
        fmt.Println("Ошибка:", err)
        return
    }

    fmt.Println(w.City)        // London
    fmt.Println(w.Temperature) // 12.3
    fmt.Println(w.Description) // Rain
}
` + "```" + `

Важно: передаём **указатель** (` + "`" + `&w` + "`" + `), чтобы ` + "`" + `Unmarshal` + "`" + ` мог записать данные в нашу переменную.

## Вложенные структуры

JSON от Weather API содержит вложенные объекты. Go отлично с этим справляется:

` + "```go" + `
type APIResponse struct {
    Location struct {
        Name    string ` + "`" + `json:"name"` + "`" + `
        Country string ` + "`" + `json:"country"` + "`" + `
    } ` + "`" + `json:"location"` + "`" + `
    Current struct {
        TempC     float64 ` + "`" + `json:"temp_c"` + "`" + `
        Condition struct {
            Text string ` + "`" + `json:"text"` + "`" + `
        } ` + "`" + `json:"condition"` + "`" + `
    } ` + "`" + `json:"current"` + "`" + `
}

func main() {
    jsonStr := ` + "`" + `{
        "location": {"name": "Moscow", "country": "Russia"},
        "current": {"temp_c": 15.0, "condition": {"text": "Sunny"}}
    }` + "`" + `

    var resp APIResponse
    json.Unmarshal([]byte(jsonStr), &resp)

    fmt.Println(resp.Location.Name)       // Moscow
    fmt.Println(resp.Current.TempC)       // 15
    fmt.Println(resp.Current.Condition.Text) // Sunny
}
` + "```" + `

Не нужно описывать **все** поля из JSON. Если в JSON есть поле, а в структуре его нет — оно просто игнорируется. Это очень удобно: Weather API возвращает десятки полей, а нам нужны только три.

## Encoder и Decoder

Для работы с ` + "`" + `io.Reader` + "`" + ` и ` + "`" + `io.Writer` + "`" + ` (а именно так устроены HTTP-запросы и ответы) удобнее использовать ` + "`" + `json.Encoder` + "`" + ` и ` + "`" + `json.Decoder` + "`" + `:

` + "```go" + `
// Запись JSON в HTTP-ответ
func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    resp := Weather{
        City:        "Moscow",
        Temperature: 15.5,
        Description: "Солнечно",
    }

    json.NewEncoder(w).Encode(resp)
}
` + "```" + `

` + "`" + `json.NewEncoder(w).Encode(resp)` + "`" + ` — это то же самое, что ` + "`" + `Marshal` + "`" + ` + запись в ` + "`" + `w` + "`" + `, но в одну строку и без промежуточного ` + "`" + `[]byte` + "`" + `.

Аналогично для чтения:

` + "```go" + `
// Чтение JSON из HTTP-ответа
var result APIResponse
json.NewDecoder(resp.Body).Decode(&result)
` + "```" + `

## Красивый вывод

Для отладки удобно использовать ` + "`" + `json.MarshalIndent` + "`" + `:

` + "```go" + `
data, _ := json.MarshalIndent(w, "", "  ")
fmt.Println(string(data))
` + "```" + `

Результат:

` + "```" + `json
{
  "city": "Moscow",
  "temperature": 15.5,
  "description": "Облачно"
}
` + "```" + `

## Итог

Пакет ` + "`" + `encoding/json` + "`" + ` — незаменимый инструмент для веб-разработки на Go. ` + "`" + `Marshal` + "`" + ` и ` + "`" + `Unmarshal` + "`" + ` для работы с байтами, ` + "`" + `Encoder` + "`" + ` и ` + "`" + `Decoder` + "`" + ` для потоков, теги структур для управления именами полей. В следующем уроке — HTTP-клиент для запросов к внешним API.`,

"6-5-http-client": `# HTTP-клиент в Go: запросы к внешним API

В предыдущем уроке мы научились создавать HTTP-сервер. Теперь научимся делать HTTP-запросы из Go — это нужно, чтобы наш сервер мог обращаться к Weather API.

## Простейший запрос: http.Get

Самый быстрый способ сделать GET-запрос:

` + "```go" + `
package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    resp, err := http.Get("https://httpbin.org/get")
    if err != nil {
        fmt.Println("Ошибка запроса:", err)
        return
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        fmt.Println("Ошибка чтения:", err)
        return
    }

    fmt.Println("Статус:", resp.StatusCode)
    fmt.Println("Тело:", string(body))
}
` + "```" + `

Разберём ключевые моменты:

- ` + "`" + `http.Get` + "`" + ` возвращает ` + "`" + `*http.Response` + "`" + ` и ` + "`" + `error` + "`" + `
- **Обязательно** вызываем ` + "`" + `defer resp.Body.Close()` + "`" + ` — без этого будет утечка ресурсов
- ` + "`" + `io.ReadAll` + "`" + ` читает всё тело ответа в ` + "`" + `[]byte` + "`" + `

## Важно: ioutil устарел

В старых туториалах вы можете встретить ` + "`" + `ioutil.ReadAll` + "`" + `. Начиная с Go 1.16, пакет ` + "`" + `ioutil` + "`" + ` считается устаревшим. Используйте ` + "`" + `io.ReadAll` + "`" + ` вместо ` + "`" + `ioutil.ReadAll` + "`" + `:

` + "```go" + `
// Устаревший способ — НЕ ИСПОЛЬЗУЙТЕ
// body, err := ioutil.ReadAll(resp.Body)

// Правильный способ
body, err := io.ReadAll(resp.Body)
` + "```" + `

## http.Client

Функция ` + "`" + `http.Get` + "`" + ` использует клиент по умолчанию (` + "`" + `http.DefaultClient` + "`" + `). У него нет таймаута — запрос может висеть бесконечно. Для реальных приложений всегда создавайте свой клиент:

` + "```go" + `
client := &http.Client{
    Timeout: 10 * time.Second,
}

resp, err := client.Get("https://httpbin.org/get")
if err != nil {
    fmt.Println("Ошибка:", err)
    return
}
defer resp.Body.Close()
` + "```" + `

Таймаут в 10 секунд означает: если за 10 секунд ответ не получен, запрос отменяется и возвращается ошибка.

## Запрос к Weather API

Теперь напишем запрос к реальному API погоды:

` + "```go" + `
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type APIResponse struct {
    Location struct {
        Name string ` + "`" + `json:"name"` + "`" + `
    } ` + "`" + `json:"location"` + "`" + `
    Current struct {
        TempC     float64 ` + "`" + `json:"temp_c"` + "`" + `
        Condition struct {
            Text string ` + "`" + `json:"text"` + "`" + `
        } ` + "`" + `json:"condition"` + "`" + `
    } ` + "`" + `json:"current"` + "`" + `
}

func main() {
    apiKey := "YOUR_API_KEY"
    city := "Moscow"
    url := fmt.Sprintf(
        "https://api.weatherapi.com/v1/current.json?key=%s&q=%s",
        apiKey, city,
    )

    client := &http.Client{Timeout: 10 * time.Second}
    resp, err := client.Get(url)
    if err != nil {
        fmt.Println("Ошибка запроса:", err)
        return
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        fmt.Println("API вернул статус:", resp.StatusCode)
        return
    }

    var result APIResponse
    err = json.NewDecoder(resp.Body).Decode(&result)
    if err != nil {
        fmt.Println("Ошибка парсинга:", err)
        return
    }

    fmt.Printf("Город: %s\n", result.Location.Name)
    fmt.Printf("Температура: %.1f°C\n", result.Current.TempC)
    fmt.Printf("Условия: %s\n", result.Current.Condition.Text)
}
` + "```" + `

Здесь мы:

1. Формируем URL с API-ключом и городом
2. Создаём клиент с таймаутом
3. Делаем запрос
4. Проверяем статус ответа
5. Декодируем JSON прямо из тела ответа с помощью ` + "`" + `json.Decoder` + "`" + `

## Проверка статуса

Всегда проверяйте ` + "`" + `resp.StatusCode` + "`" + ` перед чтением тела:

` + "```go" + `
if resp.StatusCode != http.StatusOK {
    body, _ := io.ReadAll(resp.Body)
    fmt.Printf("Ошибка API: статус %d, тело: %s\n", resp.StatusCode, body)
    return
}
` + "```" + `

Типичные коды ошибок:

- ` + "`" + `400` + "`" + ` — неправильный запрос (неверный город)
- ` + "`" + `401` + "`" + ` — неверный API-ключ
- ` + "`" + `403` + "`" + ` — доступ запрещён
- ` + "`" + `429` + "`" + ` — слишком много запросов (лимит исчерпан)
- ` + "`" + `500` + "`" + ` — ошибка на стороне API

## Вынесение в функцию

Для нашего проекта запрос к API лучше вынести в отдельную функцию:

` + "```go" + `
func fetchWeather(client *http.Client, apiKey, city string) (*APIResponse, error) {
    url := fmt.Sprintf(
        "https://api.weatherapi.com/v1/current.json?key=%s&q=%s",
        apiKey, city,
    )

    resp, err := client.Get(url)
    if err != nil {
        return nil, fmt.Errorf("ошибка запроса: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API вернул статус %d", resp.StatusCode)
    }

    var result APIResponse
    err = json.NewDecoder(resp.Body).Decode(&result)
    if err != nil {
        return nil, fmt.Errorf("ошибка парсинга JSON: %w", err)
    }

    return &result, nil
}
` + "```" + `

Функция принимает клиент, ключ и город, возвращает результат или ошибку. Чистый, переиспользуемый код.

## Итог

Теперь вы умеете делать HTTP-запросы из Go. Всегда используйте свой ` + "`" + `http.Client` + "`" + ` с таймаутом, не забывайте закрывать ` + "`" + `resp.Body` + "`" + `, проверяйте статус ответа и используйте ` + "`" + `io` + "`" + ` вместо устаревшего ` + "`" + `ioutil` + "`" + `. В следующем уроке — переменные окружения и хранение API-ключей.`,

"6-6-env-vars": `# Переменные окружения: хранение секретов

API-ключ — это секрет. Его нельзя хранить в коде и коммитить в Git. Любой, кто увидит ваш репозиторий, сможет использовать ваш ключ. В этом уроке мы научимся правильно хранить секреты с помощью переменных окружения.

## Что такое переменные окружения

Переменные окружения (environment variables) — это пары «ключ-значение», доступные программе из операционной системы. Вы можете установить их в терминале:

` + "```bash" + `
# Установить переменную
export WEATHER_API_KEY="abc123"

# Проверить
echo $WEATHER_API_KEY
` + "```" + `

## os.Getenv

В Go переменные окружения читаются через ` + "`" + `os.Getenv` + "`" + `:

` + "```go" + `
package main

import (
    "fmt"
    "os"
)

func main() {
    apiKey := os.Getenv("WEATHER_API_KEY")
    if apiKey == "" {
        fmt.Println("WEATHER_API_KEY не установлен")
        return
    }

    fmt.Println("API ключ загружен, длина:", len(apiKey))
}
` + "```" + `

` + "`" + `os.Getenv` + "`" + ` возвращает пустую строку, если переменная не установлена. Есть также ` + "`" + `os.LookupEnv` + "`" + `, которая позволяет отличить пустое значение от отсутствующей переменной:

` + "```go" + `
value, exists := os.LookupEnv("WEATHER_API_KEY")
if !exists {
    fmt.Println("Переменная не установлена")
} else if value == "" {
    fmt.Println("Переменная установлена, но пустая")
} else {
    fmt.Println("Ключ:", value)
}
` + "```" + `

## Файл .env

Каждый раз писать ` + "`" + `export` + "`" + ` в терминале неудобно. Поэтому используют файл ` + "`" + `.env` + "`" + `:

` + "```" + `
WEATHER_API_KEY=abc123def456
PORT=8080
` + "```" + `

Создайте этот файл в корне проекта. **Важно:** сразу добавьте ` + "`" + `.env` + "`" + ` в ` + "`" + `.gitignore` + "`" + `:

` + "```bash" + `
echo ".env" >> .gitignore
` + "```" + `

## godotenv

Go не читает ` + "`" + `.env` + "`" + ` файлы автоматически. Для этого есть популярная библиотека ` + "`" + `godotenv` + "`" + `:

` + "```bash" + `
go get github.com/joho/godotenv
` + "```" + `

Использование:

` + "```go" + `
package main

import (
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
)

func main() {
    // Загружаем переменные из .env файла
    err := godotenv.Load()
    if err != nil {
        log.Println("Файл .env не найден, используем системные переменные")
    }

    apiKey := os.Getenv("WEATHER_API_KEY")
    if apiKey == "" {
        log.Fatal("WEATHER_API_KEY не установлен")
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080" // значение по умолчанию
    }

    fmt.Printf("API ключ загружен, сервер на порту %s\n", port)
}
` + "```" + `

Обратите внимание: мы **не завершаем** программу, если ` + "`" + `.env` + "`" + ` не найден. В продакшене (и в Docker) переменные обычно передаются через окружение, а не через файл. Файл ` + "`" + `.env` + "`" + ` — это инструмент для локальной разработки.

## Полный пример для нашего проекта

Вот как будет выглядеть загрузка конфигурации в проекте «Погода»:

` + "```go" + `
package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/joho/godotenv"
)

var (
    apiKey     string
    httpClient *http.Client
)

func init() {
    godotenv.Load() // игнорируем ошибку — в продакшене .env может не быть

    apiKey = os.Getenv("WEATHER_API_KEY")
    if apiKey == "" {
        log.Fatal("WEATHER_API_KEY не установлен")
    }

    httpClient = &http.Client{Timeout: 10 * time.Second}
}

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    mux := http.NewServeMux()
    mux.HandleFunc("/weather", weatherHandler)

    fmt.Printf("Сервер запущен на http://localhost:%s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, mux))
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        http.Error(w, "параметр city обязателен", http.StatusBadRequest)
        return
    }

    fmt.Fprintf(w, "Погода для %s (API ключ загружен)", city)
}
` + "```" + `

Мы использовали функцию ` + "`" + `init()` + "`" + ` — она вызывается автоматически при запуске программы, до ` + "`" + `main()` + "`" + `. Это удобное место для загрузки конфигурации.

## .env.example

Хорошая практика — создать файл ` + "`" + `.env.example` + "`" + ` с примером переменных (без реальных значений) и закоммитить его:

` + "```" + `
WEATHER_API_KEY=your_api_key_here
PORT=8080
` + "```" + `

Это подскажет другим разработчикам, какие переменные нужно настроить.

## Итог

Переменные окружения — стандартный способ хранения конфигурации и секретов. Используйте ` + "`" + `os.Getenv` + "`" + ` для чтения, ` + "`" + `godotenv` + "`" + ` для удобства локальной разработки и никогда не коммитьте файл ` + "`" + `.env` + "`" + ` в Git. В следующем уроке — реализация кеша.`,

"6-7-caching": `# Кеширование: map + time.Time

Кеш — это временное хранилище, позволяющее избежать повторных дорогих операций. В нашем случае «дорогая операция» — запрос к Weather API. Давайте реализуем простой кеш с помощью ` + "`" + `map` + "`" + ` и ` + "`" + `time.Time` + "`" + `.

## Зачем кеш

Без кеша каждый запрос ` + "`" + `/weather?city=Moscow` + "`" + ` приводит к вызову Weather API. Проблемы:

- API имеет лимит запросов (бесплатный план — часто 1000 в день)
- Запрос к API занимает 200-500 мс, из кеша — менее 1 мс
- Погода не меняется каждую секунду, обновления раз в 10 минут достаточно

## Структура кеша

Кеш — это ` + "`" + `map` + "`" + `, где ключ — название города, а значение — данные и время сохранения:

` + "```go" + `
package main

import (
    "fmt"
    "time"
)

type CacheEntry struct {
    Data      WeatherData
    CreatedAt time.Time
}

type WeatherData struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}

type Cache struct {
    entries map[string]CacheEntry
    ttl     time.Duration
}

func NewCache(ttl time.Duration) *Cache {
    return &Cache{
        entries: make(map[string]CacheEntry),
        ttl:     ttl,
    }
}
` + "```" + `

## Методы Get и Set

` + "```go" + `
func (c *Cache) Get(key string) (WeatherData, bool) {
    entry, exists := c.entries[key]
    if !exists {
        return WeatherData{}, false
    }

    // Проверяем TTL
    if time.Since(entry.CreatedAt) > c.ttl {
        delete(c.entries, key)
        return WeatherData{}, false
    }

    return entry.Data, true
}

func (c *Cache) Set(key string, data WeatherData) {
    c.entries[key] = CacheEntry{
        Data:      data,
        CreatedAt: time.Now(),
    }
}
` + "```" + `

` + "`" + `time.Since(entry.CreatedAt)` + "`" + ` возвращает, сколько времени прошло с момента сохранения. Если больше TTL — запись считается устаревшей, удаляем и возвращаем «не найдено».

## Полный пример

` + "```go" + `
package main

import (
    "fmt"
    "time"
)

type WeatherData struct {
    City        string
    Temperature float64
    Description string
}

type CacheEntry struct {
    Data      WeatherData
    CreatedAt time.Time
}

type Cache struct {
    entries map[string]CacheEntry
    ttl     time.Duration
}

func NewCache(ttl time.Duration) *Cache {
    return &Cache{
        entries: make(map[string]CacheEntry),
        ttl:     ttl,
    }
}

func (c *Cache) Get(key string) (WeatherData, bool) {
    entry, exists := c.entries[key]
    if !exists {
        return WeatherData{}, false
    }

    if time.Since(entry.CreatedAt) > c.ttl {
        delete(c.entries, key)
        return WeatherData{}, false
    }

    return entry.Data, true
}

func (c *Cache) Set(key string, data WeatherData) {
    c.entries[key] = CacheEntry{
        Data:      data,
        CreatedAt: time.Now(),
    }
}

func main() {
    cache := NewCache(10 * time.Minute)

    // Сохраняем данные
    cache.Set("moscow", WeatherData{
        City:        "Moscow",
        Temperature: 15.0,
        Description: "Облачно",
    })

    // Получаем из кеша
    if data, ok := cache.Get("moscow"); ok {
        fmt.Printf("Из кеша: %s, %.1f°C, %s\n",
            data.City, data.Temperature, data.Description)
    }

    // Несуществующий ключ
    if _, ok := cache.Get("london"); !ok {
        fmt.Println("London не найден в кеше")
    }
}
` + "```" + `

Вывод:

` + "```" + `
Из кеша: Moscow, 15.0°C, Облачно
London не найден в кеше
` + "```" + `

## Интеграция с обработчиком

Вот как кеш будет использоваться в HTTP-обработчике:

` + "```go" + `
var cache = NewCache(10 * time.Minute)

func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        http.Error(w, "параметр city обязателен", http.StatusBadRequest)
        return
    }

    // Проверяем кеш
    if data, ok := cache.Get(city); ok {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(data)
        return
    }

    // Запрашиваем API
    data, err := fetchWeather(city)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Сохраняем в кеш
    cache.Set(city, data)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}
` + "```" + `

## Ограничение: потокобезопасность

Наш кеш **не является потокобезопасным**. Если два запроса одновременно обращаются к кешу, может произойти ошибка. Для простого проекта это допустимо, но в реальном приложении используют ` + "`" + `sync.RWMutex` + "`" + `:

` + "```go" + `
type Cache struct {
    entries map[string]CacheEntry
    ttl     time.Duration
    mu      sync.RWMutex
}

func (c *Cache) Get(key string) (WeatherData, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()

    entry, exists := c.entries[key]
    if !exists {
        return WeatherData{}, false
    }

    if time.Since(entry.CreatedAt) > c.ttl {
        // Не удаляем здесь — у нас только RLock
        return WeatherData{}, false
    }

    return entry.Data, true
}

func (c *Cache) Set(key string, data WeatherData) {
    c.mu.Lock()
    defer c.mu.Unlock()

    c.entries[key] = CacheEntry{
        Data:      data,
        CreatedAt: time.Now(),
    }
}
` + "```" + `

` + "`" + `RLock` + "`" + ` позволяет нескольким горутинам читать одновременно, а ` + "`" + `Lock` + "`" + ` блокирует доступ для записи. Мы подробнее разберём горутины и мьютексы в будущих спринтах.

## Итог

Мы реализовали простой TTL-кеш на основе ` + "`" + `map` + "`" + ` и ` + "`" + `time.Time` + "`" + `. Он проверяет свежесть данных при каждом чтении и удаляет устаревшие записи. Для нашего проекта этого более чем достаточно. В следующем уроке — интерфейсы в Go.`,

"6-8-interfaces": `# Интерфейсы в Go: duck typing

Интерфейсы — одна из самых важных концепций в Go. Они позволяют писать гибкий, тестируемый и расширяемый код. В этом уроке мы разберём, что такое интерфейс, как работает duck typing и зачем это нужно в нашем проекте.

## Что такое интерфейс

Интерфейс — это набор методов. Любой тип, который реализует эти методы, автоматически удовлетворяет интерфейсу:

` + "```go" + `
type Animal interface {
    Speak() string
}

type Dog struct{}
type Cat struct{}

func (d Dog) Speak() string { return "Гав!" }
func (c Cat) Speak() string { return "Мяу!" }

func MakeNoise(a Animal) {
    fmt.Println(a.Speak())
}

func main() {
    MakeNoise(Dog{}) // Гав!
    MakeNoise(Cat{}) // Мяу!
}
` + "```" + `

Обратите внимание: нигде не написано «Dog реализует Animal». Это и есть **duck typing**: «если оно ходит как утка и крякает как утка — это утка». Если тип имеет нужные методы — он реализует интерфейс.

## Интерфейс для кеша

Зачем интерфейсы в нашем проекте? Представьте, что сначала мы используем кеш на основе ` + "`" + `map` + "`" + `, а потом хотим заменить его на Redis. С интерфейсом это легко:

` + "```go" + `
type WeatherCache interface {
    Get(key string) (WeatherData, bool)
    Set(key string, data WeatherData)
}
` + "```" + `

Теперь любой тип с методами ` + "`" + `Get` + "`" + ` и ` + "`" + `Set` + "`" + ` может использоваться как кеш:

` + "```go" + `
// Реализация 1: кеш в памяти
type MemoryCache struct {
    entries map[string]CacheEntry
    ttl     time.Duration
}

func (c *MemoryCache) Get(key string) (WeatherData, bool) {
    entry, exists := c.entries[key]
    if !exists {
        return WeatherData{}, false
    }
    if time.Since(entry.CreatedAt) > c.ttl {
        delete(c.entries, key)
        return WeatherData{}, false
    }
    return entry.Data, true
}

func (c *MemoryCache) Set(key string, data WeatherData) {
    c.entries[key] = CacheEntry{
        Data:      data,
        CreatedAt: time.Now(),
    }
}
` + "```" + `

Если в будущем мы захотим добавить Redis-кеш:

` + "```go" + `
// Реализация 2: кеш в Redis (схематично)
type RedisCache struct {
    client *redis.Client
    ttl    time.Duration
}

func (c *RedisCache) Get(key string) (WeatherData, bool) {
    // чтение из Redis
    return WeatherData{}, false
}

func (c *RedisCache) Set(key string, data WeatherData) {
    // запись в Redis
}
` + "```" + `

Обе реализации удовлетворяют интерфейсу ` + "`" + `WeatherCache` + "`" + `. Код, который использует кеш, не знает и не заботится, какая реализация подставлена:

` + "```go" + `
type Server struct {
    cache  WeatherCache
    apiKey string
}

func NewServer(cache WeatherCache, apiKey string) *Server {
    return &Server{cache: cache, apiKey: apiKey}
}
` + "```" + `

## Пустой интерфейс

В Go есть специальный пустой интерфейс ` + "`" + `interface{}` + "`" + ` (или ` + "`" + `any` + "`" + ` в Go 1.18+). Ему удовлетворяет **любой** тип:

` + "```go" + `
func printAnything(v any) {
    fmt.Println(v)
}

printAnything(42)
printAnything("hello")
printAnything(true)
` + "```" + `

` + "`" + `any` + "`" + ` — это псевдоним для ` + "`" + `interface{}` + "`" + `. Используйте ` + "`" + `any` + "`" + ` — это современный и читаемый вариант.

## Стандартные интерфейсы

Стандартная библиотека Go построена на интерфейсах. Вот самые важные:

` + "```go" + `
// io.Reader — чтение данных
type Reader interface {
    Read(p []byte) (n int, err error)
}

// io.Writer — запись данных
type Writer interface {
    Write(p []byte) (n int, err error)
}

// fmt.Stringer — строковое представление
type Stringer interface {
    String() string
}

// error — встроенный интерфейс ошибки
type error interface {
    Error() string
}
` + "```" + `

Вы уже использовали интерфейсы, не зная об этом! ` + "`" + `http.ResponseWriter` + "`" + ` — это интерфейс, ` + "`" + `error` + "`" + ` — это интерфейс.

## Пример: fmt.Stringer

` + "```go" + `
type WeatherData struct {
    City        string
    Temperature float64
}

func (w WeatherData) String() string {
    return fmt.Sprintf("%s: %.1f°C", w.City, w.Temperature)
}

func main() {
    data := WeatherData{City: "Moscow", Temperature: 15.0}
    fmt.Println(data) // Moscow: 15.0°C
}
` + "```" + `

Реализовав метод ` + "`" + `String() string` + "`" + `, наш тип удовлетворяет интерфейсу ` + "`" + `fmt.Stringer` + "`" + `, и ` + "`" + `fmt.Println` + "`" + ` выводит наше форматирование.

## Проверка типа

Иногда нужно узнать конкретный тип за интерфейсом. Для этого используют **type assertion**:

` + "```go" + `
var cache WeatherCache = NewMemoryCache(10 * time.Minute)

// Проверяем, является ли кеш MemoryCache
if mc, ok := cache.(*MemoryCache); ok {
    fmt.Println("Это MemoryCache с TTL:", mc.ttl)
}
` + "```" + `

Используйте двухзначную форму (` + "`" + `value, ok` + "`" + `), чтобы избежать паники при несовпадении типов.

## Правила хорошего тона

1. **Маленькие интерфейсы** — интерфейс с 1-2 методами лучше, чем с 10
2. **Определяйте интерфейс там, где он используется**, а не там, где реализуется
3. **Не создавайте интерфейс заранее** — сначала напишите конкретный тип, потом извлеките интерфейс, когда появится вторая реализация

## Итог

Интерфейсы в Go — это контракт из набора методов. Благодаря duck typing реализация происходит неявно. Интерфейсы делают код гибким: можно подменить кеш, подменить HTTP-клиент, подменить что угодно — без изменения основной логики. В следующем уроке — Docker.`,

"6-9-docker": `# Docker: контейнеризация Go-приложения

Docker позволяет упаковать приложение со всеми зависимостями в контейнер, который запускается одинаково на любой машине. В этом уроке мы разберём, что такое Docker и как написать Dockerfile для Go-приложения.

## Что такое контейнер

Контейнер — это изолированная среда для запуска приложения. Он содержит:

- Код приложения
- Зависимости
- Минимальную операционную систему

Контейнер **не является** виртуальной машиной. Он использует ядро хост-системы и работает гораздо быстрее и легче.

Зачем это нужно:

- «У меня на компьютере работает» — больше не проблема
- Одинаковое поведение на dev, staging и production
- Простой деплой: один файл (образ) содержит всё необходимое
- Изоляция: приложения не мешают друг другу

## Установка Docker

` + "```bash" + `
# macOS
brew install --cask docker

# Linux (Ubuntu)
sudo apt-get install docker.io

# Проверка
docker --version
` + "```" + `

## Dockerfile для Go

Go компилируется в один бинарный файл. Это идеально для Docker — нам не нужен тяжёлый runtime. Используем **multi-stage build**:

` + "```" + `Dockerfile
# Этап 1: сборка
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o weather-app .

# Этап 2: запуск
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/weather-app .

EXPOSE 8080

CMD ["./weather-app"]
` + "```" + `

Разберём каждую строку:

**Этап 1 (builder):**

- ` + "`" + `FROM golang:1.23-alpine AS builder` + "`" + ` — берём образ Go на базе Alpine Linux
- ` + "`" + `WORKDIR /app` + "`" + ` — рабочая директория внутри контейнера
- ` + "`" + `COPY go.mod go.sum ./` + "`" + ` — копируем файлы зависимостей
- ` + "`" + `RUN go mod download` + "`" + ` — скачиваем зависимости (кешируется Docker-ом)
- ` + "`" + `COPY . .` + "`" + ` — копируем весь исходный код
- ` + "`" + `RUN CGO_ENABLED=0 ...` + "`" + ` — компилируем статический бинарник

**Этап 2 (runtime):**

- ` + "`" + `FROM alpine:latest` + "`" + ` — минимальный образ (~5 МБ)
- ` + "`" + `COPY --from=builder /app/weather-app .` + "`" + ` — копируем только бинарник из первого этапа
- ` + "`" + `EXPOSE 8080` + "`" + ` — документируем, что приложение слушает порт 8080
- ` + "`" + `CMD` + "`" + ` — команда запуска

## Зачем multi-stage

Образ Go весит около 800 МБ. Но наш бинарник — всего 10-15 МБ. Multi-stage build позволяет собрать приложение в тяжёлом образе, а запустить — в лёгком. Итоговый образ — около 20 МБ.

## .dockerignore

Создайте файл ` + "`" + `.dockerignore` + "`" + `, чтобы не копировать лишнее в контейнер:

` + "```" + `
.env
.git
*.md
` + "```" + `

## Сборка и запуск

` + "```bash" + `
# Собрать образ
docker build -t weather-app .

# Запустить контейнер
docker run -p 8080:8080 -e WEATHER_API_KEY=your_key weather-app

# Проверить
curl "http://localhost:8080/weather?city=Moscow"
` + "```" + `

Разберём флаги ` + "`" + `docker run` + "`" + `:

- ` + "`" + `-p 8080:8080` + "`" + ` — пробрасываем порт: порт хоста : порт контейнера
- ` + "`" + `-e WEATHER_API_KEY=your_key` + "`" + ` — передаём переменную окружения
- ` + "`" + `weather-app` + "`" + ` — имя образа

## Полезные команды

` + "```bash" + `
# Список запущенных контейнеров
docker ps

# Остановить контейнер
docker stop <container_id>

# Список образов
docker images

# Удалить образ
docker rmi weather-app

# Логи контейнера
docker logs <container_id>

# Запуск в фоне
docker run -d -p 8080:8080 -e WEATHER_API_KEY=your_key weather-app
` + "```" + `

Флаг ` + "`" + `-d` + "`" + ` (detached) запускает контейнер в фоне.

## Тегирование

Для версионирования образов используют теги:

` + "```bash" + `
# Собрать с тегом версии
docker build -t weather-app:v1.0.0 .

# latest — тег по умолчанию
docker build -t weather-app:latest .
` + "```" + `

## Пример: запуск с .env файлом

Если не хотите передавать переменные через ` + "`" + `-e` + "`" + `, можно использовать ` + "`" + `--env-file` + "`" + `:

` + "```bash" + `
docker run -p 8080:8080 --env-file .env weather-app
` + "```" + `

Docker прочитает переменные из файла ` + "`" + `.env` + "`" + ` и передаст их в контейнер.

## Итог

Docker позволяет упаковать Go-приложение в легковесный контейнер. Multi-stage build сокращает размер образа до минимума. Переменные окружения передаются через ` + "`" + `-e` + "`" + ` или ` + "`" + `--env-file` + "`" + `. В следующем уроке — чеклист перед началом проекта.`,

"6-10-checklist": `# Чеклист перед проектом «Погода»

Перед тем как приступить к проекту, давайте убедимся, что всё готово. В этом уроке — чеклист знаний, инструментов и подготовительных шагов.

## Знания: что вы должны понимать

Пройдитесь по списку. Если какой-то пункт вызывает сомнения — вернитесь к соответствующему уроку.

**HTTP-сервер (урок 6-3):**
- [ ] Знаю, как создать сервер с ` + "`" + `http.HandleFunc` + "`" + ` и ` + "`" + `http.ListenAndServe` + "`" + `
- [ ] Умею читать query-параметры из ` + "`" + `r.URL.Query().Get()` + "`" + `
- [ ] Умею возвращать JSON-ответ и устанавливать заголовки
- [ ] Знаю, как вернуть ошибку с правильным HTTP-кодом

**JSON (урок 6-4):**
- [ ] Знаю разницу между ` + "`" + `Marshal` + "`" + ` и ` + "`" + `Unmarshal` + "`" + `
- [ ] Понимаю теги структур (` + "`" + `json:\"name\"` + "`" + `)
- [ ] Умею использовать ` + "`" + `json.NewEncoder` + "`" + ` и ` + "`" + `json.NewDecoder` + "`" + `

**HTTP-клиент (урок 6-5):**
- [ ] Умею делать GET-запрос с ` + "`" + `http.Client` + "`" + `
- [ ] Помню про ` + "`" + `defer resp.Body.Close()` + "`" + `
- [ ] Знаю, как проверить статус ответа
- [ ] Использую ` + "`" + `io.ReadAll` + "`" + ` вместо ` + "`" + `ioutil.ReadAll` + "`" + `

**Переменные окружения (урок 6-6):**
- [ ] Знаю ` + "`" + `os.Getenv` + "`" + ` и ` + "`" + `godotenv` + "`" + `
- [ ] Понимаю, зачем нужен файл ` + "`" + `.env` + "`" + ` и почему он не в Git

**Кеширование (урок 6-7):**
- [ ] Могу реализовать простой кеш с ` + "`" + `map` + "`" + ` и ` + "`" + `time.Time` + "`" + `
- [ ] Понимаю концепцию TTL

**Docker (урок 6-9):**
- [ ] Понимаю, что такое контейнер и образ
- [ ] Могу написать multi-stage Dockerfile для Go

## Инструменты: что должно быть установлено

Проверьте каждый пункт в терминале:

` + "```bash" + `
# Go
go version
# Ожидаем: go1.21 или новее

# Git
git version

# Docker
docker --version

# curl (обычно предустановлен)
curl --version
` + "```" + `

## Подготовка проекта

Создайте структуру проекта:

` + "```bash" + `
# Создаём директорию
mkdir weather-app
cd weather-app

# Инициализируем Go модуль
go mod init github.com/yourusername/weather-app

# Инициализируем Git
git init

# Создаём .gitignore
cat > .gitignore << 'EOF'
.env
weather-app
EOF

# Создаём .env.example
cat > .env.example << 'EOF'
WEATHER_API_KEY=your_api_key_here
PORT=8080
EOF

# Создаём .env (НЕ коммитим!)
cp .env.example .env
# Вставьте свой API ключ в .env
` + "```" + `

## Получение API-ключа

1. Зайдите на [weatherapi.com](https://www.weatherapi.com/)
2. Зарегистрируйтесь (бесплатно)
3. Скопируйте API-ключ из личного кабинета
4. Вставьте ключ в файл ` + "`" + `.env` + "`" + `:

` + "```" + `
WEATHER_API_KEY=ваш_ключ_здесь
` + "```" + `

Проверьте, что ключ работает:

` + "```bash" + `
curl "https://api.weatherapi.com/v1/current.json?key=ВАШ_КЛЮЧ&q=Moscow"
` + "```" + `

Если видите JSON с данными о погоде — всё работает.

## Установка зависимости

Нам понадобится только одна внешняя зависимость:

` + "```bash" + `
go get github.com/joho/godotenv
` + "```" + `

## План работы

Проект разбит на три шага (три урока спринта 7):

| Шаг | Что делаем | Результат |
|-----|-----------|-----------|
| 1 | Сервер-заглушка | ` + "`" + `/weather` + "`" + ` возвращает фиксированный JSON |
| 2 | Подключение API | Реальные данные от Weather API |
| 3 | Кеш + Docker | Кеширование и контейнеризация |

Каждый шаг — отдельный коммит. Не пытайтесь сделать всё сразу. Маленькие шаги — ключ к успеху.

## Правила работы

1. **Один шаг за раз.** Не забегайте вперёд
2. **Тестируйте через curl** после каждого изменения
3. **Коммитьте** после каждого рабочего шага
4. **Читайте ошибки.** Go выдаёт понятные сообщения об ошибках
5. **Не копируйте бездумно.** Набирайте код руками — так вы лучше его поймёте

## Итог

Если все пункты чеклиста выполнены — вы готовы к проекту. В следующем спринте мы начнём писать код. Удачи!`,

"7-1-requirement-1": `# Шаг 1: сервер-заглушка

Начинаем проект! Первый шаг — самый простой, но очень важный. Мы создадим HTTP-сервер, который возвращает **фиксированный** JSON на эндпоинт ` + "`" + `/weather` + "`" + `. Никаких внешних API, никакого кеша — только сервер и заглушка.

## Зачем заглушка

Может показаться, что это лишний шаг — зачем возвращать фейковые данные? Но это стандартная практика:

- Вы убеждаетесь, что сервер запускается и отвечает
- Можно начать тестировать клиентскую часть, не дожидаясь API
- Если что-то сломается на следующем шаге — вы точно знаете, что сервер работает

## Создаём main.go

Создайте файл ` + "`" + `main.go` + "`" + ` в корне проекта:

` + "```go" + `
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

type WeatherResponse struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "параметр city обязателен",
        })
        return
    }

    // Пока возвращаем фиксированные данные
    resp := WeatherResponse{
        City:        city,
        Temperature: 20.0,
        Description: "Солнечно",
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/weather", weatherHandler)

    port := "8080"
    fmt.Printf("Сервер запущен на http://localhost:%s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, mux))
}
` + "```" + `

Разберём код:

1. **Структура ` + "`" + `WeatherResponse` + "`" + `** — описывает формат ответа с JSON-тегами
2. **` + "`" + `weatherHandler` + "`" + `** — обработчик запросов:
   - Читает параметр ` + "`" + `city` + "`" + ` из URL
   - Если ` + "`" + `city` + "`" + ` пустой — возвращает ошибку 400
   - Иначе возвращает фиксированный JSON
3. **` + "`" + `main` + "`" + `** — создаёт маршрутизатор, регистрирует обработчик, запускает сервер

## Запуск

` + "```bash" + `
go run main.go
` + "```" + `

Вы должны увидеть:

` + "```" + `
Сервер запущен на http://localhost:8080
` + "```" + `

## Тестирование с curl

Откройте **новый терминал** (сервер занимает текущий) и выполните:

` + "```bash" + `
# Запрос с городом
curl "http://localhost:8080/weather?city=Moscow"
` + "```" + `

Ожидаемый ответ:

` + "```" + `json
{"city":"Moscow","temperature":20,"description":"Солнечно"}
` + "```" + `

` + "```bash" + `
# Запрос без города — ошибка
curl "http://localhost:8080/weather"
` + "```" + `

Ожидаемый ответ:

` + "```" + `json
{"error":"параметр city обязателен"}
` + "```" + `

` + "```bash" + `
# Красивый вывод с jq (если установлен)
curl -s "http://localhost:8080/weather?city=London" | jq .
` + "```" + `

` + "```" + `json
{
  "city": "London",
  "temperature": 20,
  "description": "Солнечно"
}
` + "```" + `

Обратите внимание: город меняется (мы берём его из параметра), но температура и описание всегда одинаковые. Это нормально — это заглушка.

## Проверка с флагом -v

` + "```bash" + `
curl -v "http://localhost:8080/weather?city=Moscow"
` + "```" + `

Флаг ` + "`" + `-v` + "`" + ` покажет заголовки. Убедитесь, что видите:

` + "```" + `
< HTTP/1.1 200 OK
< Content-Type: application/json
` + "```" + `

## Добавляем корневой маршрут

Полезно добавить обработчик для ` + "`" + `/` + "`" + `, чтобы при открытии в браузере была подсказка:

` + "```go" + `
func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Weather API. Используйте /weather?city=Moscow")
    })

    mux.HandleFunc("/weather", weatherHandler)

    port := "8080"
    fmt.Printf("Сервер запущен на http://localhost:%s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, mux))
}
` + "```" + `

## Коммит

Первый рабочий шаг готов. Делаем коммит:

` + "```bash" + `
git add .
git commit -m "feat: добавить сервер-заглушку с эндпоинтом /weather"
` + "```" + `

## Что дальше

На этом шаге мы убедились:
- Сервер запускается
- Маршрутизация работает
- JSON формируется правильно
- Обработка ошибок на месте

В следующем уроке мы заменим фиксированные данные на реальные — подключим Weather API.`,

"7-2-requirement-2": `# Шаг 2: подключение Weather API

Сервер-заглушка работает. Теперь подключим настоящий Weather API — и наш сервер будет возвращать реальную погоду.

## Что меняем

1. Загружаем API-ключ из ` + "`" + `.env` + "`" + `
2. Делаем HTTP-запрос к Weather API
3. Парсим ответ
4. Возвращаем данные клиенту

## Устанавливаем godotenv

Если ещё не установили:

` + "```bash" + `
go get github.com/joho/godotenv
` + "```" + `

## Обновляем main.go

Заменяем содержимое ` + "`" + `main.go` + "`" + `:

` + "```go" + `
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/joho/godotenv"
)

// Ответ нашего API клиенту
type WeatherResponse struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}

// Структура ответа от Weather API (только нужные поля)
type APIResponse struct {
    Location struct {
        Name string ` + "`" + `json:"name"` + "`" + `
    } ` + "`" + `json:"location"` + "`" + `
    Current struct {
        TempC     float64 ` + "`" + `json:"temp_c"` + "`" + `
        Condition struct {
            Text string ` + "`" + `json:"text"` + "`" + `
        } ` + "`" + `json:"condition"` + "`" + `
    } ` + "`" + `json:"current"` + "`" + `
}

var (
    apiKey     string
    httpClient *http.Client
)

func init() {
    godotenv.Load()

    apiKey = os.Getenv("WEATHER_API_KEY")
    if apiKey == "" {
        log.Fatal("WEATHER_API_KEY не установлен")
    }

    httpClient = &http.Client{Timeout: 10 * time.Second}
}

func fetchWeather(city string) (*WeatherResponse, error) {
    url := fmt.Sprintf(
        "https://api.weatherapi.com/v1/current.json?key=%s&q=%s",
        apiKey, city,
    )

    resp, err := httpClient.Get(url)
    if err != nil {
        return nil, fmt.Errorf("ошибка запроса: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API вернул статус %d", resp.StatusCode)
    }

    var apiResp APIResponse
    err = json.NewDecoder(resp.Body).Decode(&apiResp)
    if err != nil {
        return nil, fmt.Errorf("ошибка парсинга JSON: %w", err)
    }

    return &WeatherResponse{
        City:        apiResp.Location.Name,
        Temperature: apiResp.Current.TempC,
        Description: apiResp.Current.Condition.Text,
    }, nil
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "параметр city обязателен",
        })
        return
    }

    data, err := fetchWeather(city)
    if err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{
            "error": err.Error(),
        })
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Weather API. Используйте /weather?city=Moscow")
    })

    mux.HandleFunc("/weather", weatherHandler)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Printf("Сервер запущен на http://localhost:%s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, mux))
}
` + "```" + `

## Что изменилось

Сравним с предыдущей версией:

1. **Добавили ` + "`" + `init()` + "`" + `** — загружает ` + "`" + `.env` + "`" + ` и проверяет наличие API-ключа
2. **Добавили ` + "`" + `fetchWeather()` + "`" + `** — делает запрос к Weather API и парсит ответ
3. **Обновили ` + "`" + `weatherHandler` + "`" + `** — вместо фиксированных данных вызывает ` + "`" + `fetchWeather` + "`" + `
4. **Добавили обработку ошибок** — если API недоступен или вернул ошибку, клиент получит понятное сообщение

Обратите внимание на функцию ` + "`" + `fetchWeather` + "`" + `:

- Формирует URL с ключом и городом
- Делает запрос через ` + "`" + `httpClient` + "`" + ` с таймаутом
- Закрывает тело ответа через ` + "`" + `defer` + "`" + `
- Проверяет статус-код
- Декодирует JSON в структуру ` + "`" + `APIResponse` + "`" + `
- Преобразует в нашу структуру ` + "`" + `WeatherResponse` + "`" + `

## Убедитесь, что .env готов

` + "```bash" + `
cat .env
` + "```" + `

Должно быть:

` + "```" + `
WEATHER_API_KEY=ваш_реальный_ключ
PORT=8080
` + "```" + `

## Запуск и тестирование

` + "```bash" + `
go run main.go
` + "```" + `

В другом терминале:

` + "```bash" + `
# Реальная погода в Москве
curl -s "http://localhost:8080/weather?city=Moscow" | jq .
` + "```" + `

Теперь вы увидите **реальные данные**:

` + "```" + `json
{
  "city": "Moscow",
  "temperature": 18.0,
  "description": "Partly cloudy"
}
` + "```" + `

Попробуйте разные города:

` + "```bash" + `
curl -s "http://localhost:8080/weather?city=London" | jq .
curl -s "http://localhost:8080/weather?city=Tokyo" | jq .
curl -s "http://localhost:8080/weather?city=New+York" | jq .
` + "```" + `

## Тестирование ошибок

` + "```bash" + `
# Без параметра city
curl -s "http://localhost:8080/weather" | jq .
# {"error": "параметр city обязателен"}

# Несуществующий город
curl -s "http://localhost:8080/weather?city=asdqwezxc" | jq .
# {"error": "API вернул статус 400"}
` + "```" + `

## Коммит

Всё работает — коммитим:

` + "```bash" + `
git add .
git commit -m "feat: подключить Weather API, загрузка ключа из .env"
` + "```" + `

Убедитесь, что ` + "`" + `.env` + "`" + ` **не попал** в коммит:

` + "```bash" + `
git status
` + "```" + `

Файл ` + "`" + `.env` + "`" + ` должен быть в списке неотслеживаемых (untracked) или игнорируемых файлов.

## Что дальше

Сервер работает с реальными данными. Но каждый запрос к ` + "`" + `/weather` + "`" + ` вызывает обращение к Weather API. На следующем шаге мы добавим кеш и упакуем всё в Docker.`,

"7-3-requirement-3": `# Шаг 3: кеш, Dockerfile и финальная сборка

Финальный шаг! Мы добавим кеш, чтобы не дёргать API на каждый запрос, и упакуем приложение в Docker-контейнер.

## Добавляем кеш

Вставим реализацию кеша прямо в ` + "`" + `main.go` + "`" + `. Для небольшого проекта это нормально — не нужно создавать отдельные файлы ради нескольких структур.

Обновлённый ` + "`" + `main.go` + "`" + `:

` + "```go" + `
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "sync"
    "time"

    "github.com/joho/godotenv"
)

// --- Модели ---

type WeatherResponse struct {
    City        string  ` + "`" + `json:"city"` + "`" + `
    Temperature float64 ` + "`" + `json:"temperature"` + "`" + `
    Description string  ` + "`" + `json:"description"` + "`" + `
}

type APIResponse struct {
    Location struct {
        Name string ` + "`" + `json:"name"` + "`" + `
    } ` + "`" + `json:"location"` + "`" + `
    Current struct {
        TempC     float64 ` + "`" + `json:"temp_c"` + "`" + `
        Condition struct {
            Text string ` + "`" + `json:"text"` + "`" + `
        } ` + "`" + `json:"condition"` + "`" + `
    } ` + "`" + `json:"current"` + "`" + `
}

// --- Кеш ---

type CacheEntry struct {
    Data      WeatherResponse
    CreatedAt time.Time
}

type Cache struct {
    entries map[string]CacheEntry
    ttl     time.Duration
    mu      sync.RWMutex
}

func NewCache(ttl time.Duration) *Cache {
    return &Cache{
        entries: make(map[string]CacheEntry),
        ttl:     ttl,
    }
}

func (c *Cache) Get(key string) (WeatherResponse, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()

    entry, exists := c.entries[key]
    if !exists {
        return WeatherResponse{}, false
    }

    if time.Since(entry.CreatedAt) > c.ttl {
        return WeatherResponse{}, false
    }

    return entry.Data, true
}

func (c *Cache) Set(key string, data WeatherResponse) {
    c.mu.Lock()
    defer c.mu.Unlock()

    c.entries[key] = CacheEntry{
        Data:      data,
        CreatedAt: time.Now(),
    }
}

// --- Глобальные переменные ---

var (
    apiKey     string
    httpClient *http.Client
    cache      *Cache
)

func init() {
    godotenv.Load()

    apiKey = os.Getenv("WEATHER_API_KEY")
    if apiKey == "" {
        log.Fatal("WEATHER_API_KEY не установлен")
    }

    httpClient = &http.Client{Timeout: 10 * time.Second}
    cache = NewCache(10 * time.Minute)
}

// --- Запрос к API ---

func fetchWeather(city string) (*WeatherResponse, error) {
    url := fmt.Sprintf(
        "https://api.weatherapi.com/v1/current.json?key=%s&q=%s",
        apiKey, city,
    )

    resp, err := httpClient.Get(url)
    if err != nil {
        return nil, fmt.Errorf("ошибка запроса: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API вернул статус %d", resp.StatusCode)
    }

    var apiResp APIResponse
    err = json.NewDecoder(resp.Body).Decode(&apiResp)
    if err != nil {
        return nil, fmt.Errorf("ошибка парсинга JSON: %w", err)
    }

    return &WeatherResponse{
        City:        apiResp.Location.Name,
        Temperature: apiResp.Current.TempC,
        Description: apiResp.Current.Condition.Text,
    }, nil
}

// --- Обработчики ---

func weatherHandler(w http.ResponseWriter, r *http.Request) {
    city := r.URL.Query().Get("city")
    if city == "" {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "параметр city обязателен",
        })
        return
    }

    // Проверяем кеш
    if data, ok := cache.Get(city); ok {
        log.Printf("Кеш: попадание для %s\n", city)
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(data)
        return
    }

    log.Printf("Кеш: промах для %s, запрашиваем API\n", city)

    // Запрашиваем API
    data, err := fetchWeather(city)
    if err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{
            "error": err.Error(),
        })
        return
    }

    // Сохраняем в кеш
    cache.Set(city, *data)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Weather API. Используйте /weather?city=Moscow")
    })

    mux.HandleFunc("/weather", weatherHandler)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Printf("Сервер запущен на http://localhost:%s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, mux))
}
` + "```" + `

## Что добавилось

1. **Кеш с мьютексом** — потокобезопасная версия с ` + "`" + `sync.RWMutex` + "`" + `
2. **Логирование** — сервер пишет в лог, откуда взяты данные (кеш или API)
3. **Инициализация кеша** в ` + "`" + `init()` + "`" + ` с TTL 10 минут

Проверьте работу кеша:

` + "```bash" + `
# Первый запрос — промах кеша, запрос к API
curl -s "http://localhost:8080/weather?city=Moscow" | jq .

# Второй запрос — попадание в кеш (мгновенный ответ)
curl -s "http://localhost:8080/weather?city=Moscow" | jq .
` + "```" + `

В логах сервера вы увидите:

` + "```" + `
Кеш: промах для Moscow, запрашиваем API
Кеш: попадание для Moscow
` + "```" + `

## Создаём Dockerfile

Создайте файл ` + "`" + `Dockerfile` + "`" + ` в корне проекта:

` + "```" + `Dockerfile
# Этап 1: сборка
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o weather-app .

# Этап 2: запуск
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/weather-app .

EXPOSE 8080

CMD ["./weather-app"]
` + "```" + `

## Создаём .dockerignore

` + "```" + `
.env
.git
*.md
` + "```" + `

## Сборка и запуск Docker

` + "```bash" + `
# Собираем образ
docker build -t weather-app:v1.0.0 .

# Проверяем размер
docker images weather-app
# REPOSITORY    TAG       SIZE
# weather-app   v1.0.0    ~20MB
` + "```" + `

Запускаем контейнер:

` + "```bash" + `
docker run -p 8080:8080 \
  -e WEATHER_API_KEY=ваш_ключ \
  -e PORT=8080 \
  weather-app:v1.0.0
` + "```" + `

Или с ` + "`" + `--env-file` + "`" + `:

` + "```bash" + `
docker run -p 8080:8080 --env-file .env weather-app:v1.0.0
` + "```" + `

Тестируем:

` + "```bash" + `
curl -s "http://localhost:8080/weather?city=Paris" | jq .
` + "```" + `

## Финальный коммит и тег

` + "```bash" + `
git add .
git commit -m "feat: добавить кеш и Dockerfile"

# Создаём тег версии
git tag v1.0.0
` + "```" + `

## Итоговая структура проекта

` + "```" + `
weather-app/
├── .dockerignore
├── .env            ← НЕ в Git
├── .env.example
├── .gitignore
├── Dockerfile
├── go.mod
├── go.sum
└── main.go
` + "```" + `

## Что вы сделали

Оглянитесь на три шага:

1. **Сервер-заглушка** — базовый HTTP-сервер с фиксированным ответом
2. **Weather API** — реальные данные, переменные окружения, обработка ошибок
3. **Кеш + Docker** — оптимизация запросов и контейнеризация

Это полноценное серверное приложение на Go. Вы использовали:

- ` + "`" + `net/http` + "`" + ` для сервера и клиента
- ` + "`" + `encoding/json` + "`" + ` для работы с JSON
- ` + "`" + `os` + "`" + ` и ` + "`" + `godotenv` + "`" + ` для конфигурации
- ` + "`" + `map` + "`" + `, ` + "`" + `sync.RWMutex` + "`" + ` и ` + "`" + `time` + "`" + ` для кеша
- Docker для контейнеризации

Поздравляем с завершением проекта! В следующих спринтах мы будем развивать навыки дальше — тестирование, базы данных, горутины и каналы.`,
	}
	for slug, content := range lessons {
		db.Model(&models.Lesson{}).Where("slug = ?", slug).Update("content", content)
	}
}
