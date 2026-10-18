# Magic Code AI — API гэрээ

Frontend (`mci-web`) болон backend-ийн хоорондын тохиролцоо. Frontend одоогоор энэ гэрээг **mock** өгөгдлөөр (`src/api/mock/`) ажиллуулж байгаа. Backend энэ баримтын дагуу endpoint-уудаа хийсний дараа `.env` дотор `VITE_USE_MOCK=false` болгоход л бодит API руу шилжинэ.

Гэрээг өөрчлөх шаардлага гарвал энэ файлыг засаад, `src/api/` доторх mock-ийг нь хамт шинэчилнэ.

## Ерөнхий дүрэм

| | |
|---|---|
| Үндсэн хаяг | `VITE_API_URL` (жишээ нь `http://localhost:4000/api`) |
| Формат | Хүсэлт, хариу хоёулаа JSON (`Content-Type: application/json`) |
| Огноо | ISO 8601 мөр, UTC (`"2026-10-18T09:30:00.000Z"`) |
| Мөнгөн дүн | Бүхэл тоо, төгрөгөөр (`450000`), `currency: "MNT"` |
| ID | Мөр (string) |
| CORS | Frontend өөр домэйноос дуудах тул backend нь frontend-ийн домэйнд CORS зөвшөөрөх ёстой |

### Хоёр хэлтэй текст (`LocalizedText`)

Сайт монгол, англи хоёр хэлтэй. Хэрэглэгчид харагдах бүх текстийг дараах хэлбэрээр буцаана:

```json
{ "mn": "Өгөгдлийн шинжилгээ ба Power BI", "en": "Data Analysis & Power BI" }
```

### Алдааны хариу

Амжилтгүй үед (4xx, 5xx) бүх endpoint ижил бүтэцтэй хариу буцаана:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input",
    "fields": { "email": "invalid email" }
  }
}
```

`message` нь хөгжүүлэгчид зориулсан. Хэрэглэгчид харуулах текстийг frontend `code`-оор нь сонгодог (`src/api/client.js`-ийн `errorMessage`). `fields` нь зөвхөн `validation_error` үед байна.

| HTTP | `code` | Хэзээ |
|---|---|---|
| 400 | `validation_error` | Талбар буруу эсвэл дутуу |
| 404 | `not_found` | Курс, мэдээ, бүртгэл олдсонгүй |
| 409 | `enrollment_closed` | Курсын бүртгэл нээгдээгүй (`status: "planned"`) |
| 409 | `already_enrolled` | Энэ и-мэйлээр тухайн курсад аль хэдийн бүртгүүлсэн |
| 409 | `payment_not_required` | Бүртгэл төлбөр шаардахгүй (хүлээлгийн жагсаалт) |
| 429 | `rate_limited` | Хэт олон хүсэлт (ялангуяа `/chat`) |
| 500 | `internal_error` | Серверийн алдаа |

---

## 1. Курс

### `GET /courses`

Каталог хуудсанд (`/courses`) бүх курсыг харуулна.

| Query | Заавал | Тайлбар |
|---|---|---|
| `category` | үгүй | `Code`, `Data`, `AI`, `Digital`-аас нэг |

**200** — `Course[]`

```json
[
  {
    "id": "data-analysis",
    "category": "Data",
    "status": "open",
    "price": 450000,
    "title": { "mn": "Өгөгдлийн шинжилгээ ба Power BI", "en": "Data Analysis & Power BI" },
    "description": { "mn": "SQL, Python болон Power BI ашиглан...", "en": "Analyse data and build reports..." }
  }
]
```

| Талбар | Төрөл | Тайлбар |
|---|---|---|
| `id` | string | URL-д ашиглагдана (`/?course=data-analysis`), өөрчлөгдөхгүй байх ёстой |
| `category` | `"Code" \| "Data" \| "AI" \| "Digital"` | Каталогийн шүүлтүүр |
| `status` | `"open" \| "waitlist" \| "planned"` | `open` — бүртгэл + төлбөр; `waitlist` — хүлээлгийн жагсаалт; `planned` — бүртгэл хаалттай |
| `price` | number \| null | Төгрөгөөр. Үнэ батлагдаагүй бол `null` |
| `title`, `description` | LocalizedText | |

Нүүр хуудасны 3 курс одоогоор `vip-course`, `data-analysis`, `computer-skills` гэсэн id-тай. Backend мөн эдгээр id-г ашиглах ёстой.

### `GET /courses/:id`

**200** — нэг `Course`. **404** `not_found`.

---

## 2. Мэдээ ("Бидний хийсэн ажлууд")

### `GET /news`

Нүүр хуудас эхний 3-ыг (`?limit=3`), `/news` хуудас бүгдийг харуулна. Шинэ нь эхэндээ байхаар эрэмбэлнэ.

| Query | Заавал | Тайлбар |
|---|---|---|
| `limit` | үгүй | Хамгийн ихдээ хэдийг буцаах |

**200** — `NewsSummary[]`

```json
[
  {
    "id": "1",
    "number": "01",
    "category": { "mn": "Байгаль орчин", "en": "Environment" },
    "title": { "mn": "Мод тарих өдөр", "en": "Tree planting day" },
    "summary": { "mn": "Ногоон орчны төлөөх...", "en": "Share the community..." },
    "publishedAt": "2026-09-12T00:00:00.000Z"
  }
]
```

`number` нь картан дээрх том дугаар ("01", "02").

### `GET /news/:id`

Дэлгэрэнгүй хуудас (`/news/:id`). `NewsSummary`-ийн бүх талбар дээр нэмээд:

```json
{
  "...": "NewsSummary-ийн талбарууд",
  "body": { "mn": "Ажлын дэлгэрэнгүй тайлбар...", "en": "..." },
  "details": {
    "date": { "mn": "2026 оны 9-р сарын 12", "en": "12 September 2026" },
    "location": { "mn": "Улаанбаатар", "en": "Ulaanbaatar" },
    "partners": null
  }
}
```

`body` болон `details`-ийн талбар бүр `null` байж болно. Тэр үед frontend "Мэдээлэл нэмэгдэнэ" гэж харуулна. **404** `not_found`.

---

## 3. Бүртгэл ба төлбөр

Урсгал: хэрэглэгч нэр, и-мэйл, утсаа бөглөнө → `POST /enrollments` → курс `open` бол төлбөрийн алхам → `POST /payments`.

### `POST /enrollments`

```json
{
  "courseId": "data-analysis",
  "name": "Бат-Эрдэнэ",
  "email": "bat@example.com",
  "phone": "+976 9911 2233"
}
```

| Талбар | Шалгалт |
|---|---|
| `courseId` | Байгаа курс байх |
| `name` | Хоосон биш, ≤ 100 тэмдэгт |
| `email` | Зөв и-мэйл |
| `phone` | `[+0-9 ()-]`, 8–20 тэмдэгт |

**201**

```json
{
  "id": "enr_8f3k2m1a",
  "courseId": "data-analysis",
  "status": "pending_payment",
  "createdAt": "2026-10-18T09:30:00.000Z"
}
```

`status`: курс `open` бол `"pending_payment"`, `waitlist` бол `"waitlisted"`. Frontend `waitlisted`-ийг шууд амжилттай гэж харуулна, `pending_payment` бол төлбөрийн алхам руу орно.

**Алдаа:** 400 `validation_error`, 404 `not_found`, 409 `enrollment_closed`, 409 `already_enrolled`.

### `POST /payments`

```json
{ "enrollmentId": "enr_8f3k2m1a", "method": "qpay" }
```

`method`: `"qpay"` эсвэл `"bank"`.

**201**

```json
{
  "id": "pay_2c9x7q0b",
  "enrollmentId": "enr_8f3k2m1a",
  "method": "qpay",
  "status": "pending",
  "amount": 450000,
  "currency": "MNT",
  "instructions": {
    "qrImage": "data:image/png;base64,...",
    "deeplinks": [{ "name": "Khan Bank", "link": "khanbank://q?..." }]
  },
  "createdAt": "2026-10-18T09:31:00.000Z"
}
```

`instructions`: QPay бол `qrImage` + `deeplinks` (QPay-ийн invoice API-аас), банкны шилжүүлэг бол `{ "bankName", "accountNumber", "accountName", "reference" }`. Mock үед `null`.

**Алдаа:** 400 `validation_error`, 404 `not_found`, 409 `payment_not_required`.

### `GET /payments/:id` *(дараа холбоно)*

Төлбөр төлөгдсөн эсэхийг шалгах. `status`: `"pending" | "paid" | "failed" | "expired"`. QPay-ийн callback ирэхэд backend `paid` болгоно.

---

## 4. Чат туслах

### `POST /chat`

```json
{
  "message": "Төлбөр хэд вэ?",
  "lang": "mn",
  "history": [
    { "role": "assistant", "content": "Сайн уу! Сургалт, бүртгэлийн талаар асуугаарай." },
    { "role": "user", "content": "Ямар сургалтууд байна?" }
  ]
}
```

| Талбар | Тайлбар |
|---|---|
| `message` | ≤ 500 тэмдэгт |
| `lang` | `"mn"` эсвэл `"en"` — хариулах хэл |
| `history` | Өмнөх мессежүүд, хамгийн ихдээ сүүлийн 10 |

**200**

```json
{ "reply": "Өгөгдлийн шинжилгээний сургалтын үнийг magiccodeai@gmail.com хаягаар лавлаарай." }
```

AI-ийн API key-г зөвхөн backend-д хадгална. Frontend AI үйлчилгээ рүү шууд хандахгүй. Урвуулан ашиглахаас сэргийлж IP-ээр хязгаар (429 `rate_limited`) тавихыг зөвлөж байна.

---

## 5. Дараа нь нэмэх endpoint-ууд

Эдгээр одоогоор frontend дотор шууд бичигдсэн бөгөөд API-тай хараахан холбогдоогүй.

| Endpoint | Одоо хаана байна | Тайлбар |
|---|---|---|
| `GET /courses/:id/lessons` | `src/data/lessons.js` | Хичээлийн жагсаалт: `{ id, youtubeId, title: LocalizedText, creator }[]` |
| `GET /me/progress`, `PUT /me/progress/:lessonId` | localStorage (`mc-lessons-v1`) | Нэвтрэх систем хийсний дараа |
| `GET /products` | `src/data/merch.js` | Барааны жагсаалт, үнэ, үлдэгдэл |
| `POST /orders` | localStorage (`mc-cart`) | Сагсны захиалга |

---

## Frontend талд

| Файл | Үүрэг |
|---|---|
| `src/api/client.js` | `request()` — mock эсвэл бодит `fetch`, алдааг `ApiError` болгоно |
| `src/api/courses.js`, `news.js`, `enrollments.js`, `chat.js` | Endpoint бүрийн функц |
| `src/api/mock/db.js` | Mock өгөгдөл (backend-ийн хариутай ижил хэлбэртэй) |
| `src/hooks/useApi.js` | Өгөгдөл татах hook: `{ data, loading, error, reload }` |
| `src/components/ApiState/ApiState.jsx` | "Ачааллаж байна…" / алдаа + "Дахин оролдох" |

Бодит backend-тэй ажиллуулах:

```bash
cp .env.example .env
# .env дотор: VITE_USE_MOCK=false, VITE_API_URL=http://localhost:4000/api
npm run dev
```
