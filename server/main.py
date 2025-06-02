from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, EmailStr, Field, validator, root_validator
from pymongo import MongoClient
from typing import Union, List, Optional
from src.recommender import run_ga
import bcrypt
from datetime import datetime
from enum import Enum
import uuid
from bson import ObjectId
import os
import shutil

client = MongoClient("mongodb://localhost:27017")
db = client.webcoach

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


AVATAR_DIR = "src/assets/avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")

SPORT_CATEGORIES = {
    "Ігри з м'ячем": ["Футбол", "Баскетбол", "Бадмінтон", "Волейбол", "Бейсбол", "Регбі", "Хокей"],
    "Бойові мистецтва": ["Карате", "Бокс", "Ушу", "Джиу-джитсу", "ММА"],
    "Легка атлетика": ["Біг", "Стрибки", "Метання"],
    "Водні види спорту": ["Плавання", "Вітрильний спорт", "Каноїзм"],
    "Екстремальні види спорту": ["Скейбординг", "Сноубординг", "Альпінізм"],
    "Фітнес та тренажерний зал": ["Фітнес", "Силові тренування", "Йога"]
}

class BaseUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class Athlete(BaseUser):
    name: str
    age: int
    user_id: Optional[str] = None
    phone: Optional[str] = ""
    description: Optional[str] = ""
    favorite_sports: List[str] = []
    avatar_url: Optional[str] = "/avatars/default.png"

class AthleteProfileUpdate(BaseModel):
    user_id: str
    name: str
    age: int
    phone: Optional[str] = ""
    description: Optional[str] = ""
    favorite_sports: List[str] = []

class Coach(BaseUser):
    name: str
    age: int
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    description: Optional[str] = ""
    favorite_sports: List[str] = []
    phone: Optional[str] = ""
    avatar_url: Optional[str] = "/avatars/default.png"

class CoachProfileUpdate(BaseModel):
    user_id: str
    name: str
    age: int
    phone: Optional[str] = ""
    description: Optional[str] = ""
    favorite_sports: List[str] = []


class UserType(BaseModel):
    type: str  # "athlete" або "coach"
    data: Union[Athlete, Coach]

class LoginForm(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    athlete_id: str

class CurrencyEnum(str, Enum):
    UAH = "UAH"
    EUR = "EUR"
    USD = "USD"

class TrainingCreation(BaseModel):
    coach_id: str
    start_time: datetime
    end_time: datetime
    price: float
    spots: int
    currency: CurrencyEnum
    category: str
    section: str

    @validator('price')
    def price_non_negative(cls, v):
        if v < 0:
            raise ValueError("Ціна не може бути від'ємною")
        return v

    @validator('spots')
    def spots_non_negative(cls, v):
        if v < 0:
            raise ValueError("Кількість місць не може бути від'ємною")
        return v

    @root_validator(skip_on_failure=True)
    def check_times(cls, values):
        start = values.get('start_time')
        end = values.get('end_time')
        if start and end:
            if end <= start:
                raise ValueError("Час завершення не може бути раніше початку")
            if start < datetime.utcnow():
                raise ValueError("Неможливо створити тренування в минулому")
        return values

    @validator('category')
    def valid_category(cls, v):
        if v not in SPORT_CATEGORIES:
            raise ValueError("Невідома категорія")
        return v

    @validator('section')
    def valid_section(cls, v, values):
        cat = values.get('category')
        if cat and v not in SPORT_CATEGORIES[cat]:
            raise ValueError(f"Секція має належати до {cat}")
        return v

class TrainingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    price: Optional[float] = None
    spots: Optional[int] = None
    currency: Optional[CurrencyEnum] = None
    category: Optional[str] = None
    section: Optional[str] = None

    @validator('price')
    def price_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Ціна не може бути від'ємною")
        return v

    @validator('spots')
    def spots_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Кількість місць не може бути від'ємною")
        return v

    @root_validator(skip_on_failure=True)
    def check_times(cls, values):
        start = values.get('start_time')
        end = values.get('end_time')
        if start and end and end <= start:
            raise ValueError("Час завершення не може бути раніше початку")
        return values

    @validator('category')
    def valid_category(cls, v):
        if v is not None and v not in SPORT_CATEGORIES:
            raise ValueError("Невідома категорія")
        return v

    @validator('section')
    def valid_section(cls, v, values):
        cat = values.get('category')
        if cat and v is not None and v not in SPORT_CATEGORIES[cat]:
            raise ValueError(f"Секція має належати до {cat}")
        return v

class CancelPayload(BaseModel):
    athlete_id: str

class ChangePasswordRequest(BaseModel):
    user_id: str
    old_password: str
    new_password: str
    confirm_password: str

    @root_validator(skip_on_failure=True)
    def passwords_match(cls, values):
        if values.get('new_password') != values.get('confirm_password'):
            raise ValueError("Новий пароль та підтвердження не співпадають")
        if len(values.get('new_password', '')) < 6:
            raise ValueError("Новий пароль має містити принаймні 6 символів")
        return values

class Review(BaseModel):
    coach_id: str
    athlete_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = ""
    created_at: Optional[datetime] = None

class ReviewUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = ""

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

@app.post("/register")
async def register_user(payload: UserType):
    if db.athletes.find_one({"email": payload.data.email}) or db.coaches.find_one({"email": payload.data.email}):
        raise HTTPException(status_code=400, detail="Email уже використовується")
    new_id = str(uuid.uuid4())
    common = {
        "email": payload.data.email,
        "password": hash_password(payload.data.password),
        "name": payload.data.name,
        "age": payload.data.age,
        "user_id": new_id,
        "created_at": datetime.utcnow(),
        "avatar_url": "/avatars/default.png"
    }
    if payload.type == "athlete":
        athlete_data = {**common, "phone": "", "description": "", "favorite_sports": []}
        db.athletes.insert_one(Athlete(**athlete_data).dict())
        return {"message": "Атлет зареєстрований", "id": new_id}
    else:
        coach_data = {**common, "description": "", "favorite_sports": [], "phone": "", "avatar_url": "/avatars/default.png"}
        db.coaches.insert_one(Coach(**coach_data).dict())
        return {"message": "Тренер зареєстрований", "id": new_id}

@app.post("/login")
async def login_user(form: LoginForm):
    for col, role in [(db.athletes, "athlete"), (db.coaches, "coach")]:
        user = col.find_one({"email": form.email})
        if user and verify_password(form.password, user["password"]):
            return {"message": "OK", "role": role, "id": user["user_id"], "name": user["name"]}
    raise HTTPException(status_code=401, detail="Невірний email або пароль")

@app.post("/create-training")
async def create_training(tr: TrainingCreation):
    coach = db.coaches.find_one({"user_id": tr.coach_id})
    if not coach:
        raise HTTPException(status_code=404, detail="Тренер не знайдений")
    # Перевірка на конфлікт часу
    conflict = db.trainings.find_one({
        "coach_id": tr.coach_id,
        "start_time": {"$lt": tr.end_time},
        "end_time":   {"$gt": tr.start_time}
    })
    if conflict:
        raise HTTPException(status_code=400, detail="Дане тренування накладається за часом на вже існуюче – оберіть інший проміжок.")

    rec = tr.dict()
    rec["currency"]     = tr.currency.value
    rec["participants"] = []
    rec["coach_name"]   = coach["name"]     # ← додаємо ім'я тренера із БД

    res = db.trainings.insert_one(rec)
    rec["_id"] = str(res.inserted_id)
    return {"message": "Тренування створено", "training": rec}


@app.put("/trainings/{training_id}")
async def update_training(training_id: str, up: TrainingUpdate):
    try:
        tid = ObjectId(training_id)
    except:
        raise HTTPException(status_code=400, detail="Невірний ID")
    existing = db.trainings.find_one({"_id": tid})
    if not existing:
        raise HTTPException(status_code=404, detail="Тренування не знайдено")
    signed = len(existing.get("participants", []))
    if up.start_time is not None and up.end_time is not None:
        conflict = db.trainings.find_one({
            "coach_id": existing["coach_id"],
            "_id":        {"$ne": tid},
            "start_time": {"$lt": up.end_time},
            "end_time":   {"$gt": up.start_time}
        })
        if conflict:
            raise HTTPException(
              status_code=400,
              detail="Дане тренування накладається за часом на вже існуюче – оберіть інший проміжок"
            )

    diff = {}
    if up.spots is not None:
        if up.spots < signed:
            raise HTTPException(status_code=400, detail="Менше за вже підписаних")
        diff["spots"] = up.spots - signed

    for fld in ("start_time","end_time","price","currency","category","section"):
        v = getattr(up, fld)
        if v is not None:
            diff[fld] = v.value if isinstance(v, Enum) else v

    if diff:
        db.trainings.update_one({"_id": tid}, {"$set": diff})

    updated = db.trainings.find_one({"_id": tid})
    updated["_id"] = str(updated["_id"])
    return {"message": "Оновлено", "training": updated}


@app.post("/trainings/{training_id}/signup")
async def signup_for_training(training_id: str, req: SignupRequest):
    try:
        tid = ObjectId(training_id)
    except:
        raise HTTPException(status_code=400, detail="Невірний ID")
    res = db.trainings.update_one(
        {"_id": tid, "spots": {"$gt": 0}, "participants": {"$ne": req.athlete_id}},
        {"$push": {"participants": req.athlete_id}, "$inc": {"spots": -1}}
    )
    if res.modified_count == 0:
        raise HTTPException(status_code=400, detail="Не вдалося записатися")
    return {"message": "Записано"}

@app.post("/trainings/{training_id}/cancel")
async def cancel_enrollment(training_id: str, req: CancelPayload):
    try:
        tid = ObjectId(training_id)
    except:
        raise HTTPException(status_code=400, detail="Невірний ID")
    tr = db.trainings.find_one({"_id": tid})
    if req.athlete_id not in tr.get("participants", []):
        raise HTTPException(status_code=400, detail="Не записаний")
    db.trainings.update_one({"_id": tid}, {"$pull": {"participants": req.athlete_id}})
    db.trainings.update_one({"_id": tid}, {"$inc": {"spots": 1}})
    return {"message": "Скасовано"}

@app.get("/trainings")
async def get_all_trainings(request: Request):
    out = []
    for t in db.trainings.find():
        t["_id"] = str(t["_id"])
        rel = (db.coaches.find_one({"user_id": t["coach_id"]}, {"avatar_url":1}) or {}).get("avatar_url", "/avatars/default.png")
        t["avatar_url"] = str(request.base_url).rstrip("/") + rel
        out.append(t)
    return {"trainings": out}

@app.get("/athlete/trainings")
async def get_trainings_for_athlete(request: Request, athlete_id: str = Query(...)):
    out = []
    for t in db.trainings.find({"participants": athlete_id}):
        t["_id"] = str(t["_id"])
        coach = db.coaches.find_one({"user_id": t["coach_id"]}, {"avatar_url":1})
        avatar = coach["avatar_url"] if coach and coach.get("avatar_url") else "/avatars/default.png"
        t["avatar_url"] = avatar
        out.append(t)
    return {"trainings": out}

@app.get("/coach/trainings")
async def get_trainings_for_coach(coach_id: str = Query(...)):
    out = []
    for t in db.trainings.find({"coach_id": coach_id}):
        t["_id"] = str(t["_id"])
        out.append(t)
    return {"trainings": out}

@app.get("/trainings/{training_id}/participants")
async def get_training_participants(training_id: str, request: Request):
    try:
        tid = ObjectId(training_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Невірний ID тренування")

    tr = db.trainings.find_one({"_id": tid})
    if not tr:
        raise HTTPException(status_code=404, detail="Тренування не знайдено")

    raw = db.athletes.find(
        {"user_id": {"$in": tr.get("participants", [])}},
        {"user_id": 1, "name": 1, "age": 1, "avatar_url": 1, "_id": 0}
    )
    parts = list(raw)

    base = str(request.base_url).rstrip("/")
    for p in parts:
        avatar = p.get("avatar_url") or "/avatars/default.png"
        if not avatar.startswith("http"):
            avatar = avatar if avatar.startswith("/") else f"/{avatar}"
            p["avatar_url"] = f"{base}{avatar}"
        else:
            p["avatar_url"] = avatar

    return {"participants": parts}

@app.delete("/trainings/{training_id}")
async def delete_training(training_id: str):
    try:
        tid = ObjectId(training_id)
    except:
        raise HTTPException(status_code=400, detail="Невірний ID тренування")
    res = db.trainings.delete_one({"_id": tid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Тренування не знайдено")
    return {"message": "Тренування видалено"}

@app.get("/coach/profile")
async def get_coach_profile(coach_id: str = Query(...)):
    coach = db.coaches.find_one({"user_id": coach_id}, {"_id":0, "password":0})
    if not coach:
        raise HTTPException(status_code=404, detail="Тренер не знайдений")
    if not coach.get("avatar_url"):
        coach["avatar_url"] = "/avatars/default.png"
    return {"profile": coach}

@app.put("/coach/profile")
async def update_coach_profile(payload: CoachProfileUpdate):
    coach = db.coaches.find_one({"user_id": payload.user_id})
    if not coach:
        raise HTTPException(status_code=404, detail="Тренер не знайдений")

    update = {
        "name": payload.name,
        "age": payload.age,
        "phone": payload.phone,
        "description": payload.description,
        "favorite_sports": payload.favorite_sports
    }

    db.coaches.update_one({"user_id": payload.user_id}, {"$set": update})
    updated = db.coaches.find_one({"user_id": payload.user_id}, {"_id": 0, "password": 0})

    if not updated.get("avatar_url"):
        updated["avatar_url"] = "/avatars/default.png"

    return {"profile": updated}


@app.post("/coach/change-password")
async def change_coach_password(req: ChangePasswordRequest):
    coach = db.coaches.find_one({"user_id": req.user_id})
    if not coach or not verify_password(req.old_password, coach["password"]):
        raise HTTPException(status_code=401, detail="Невірний пароль")
    new_hash = hash_password(req.new_password)
    db.coaches.update_one({"user_id": req.user_id}, {"$set": {"password": new_hash}})
    return {"message": "Пароль оновлено"}

@app.post("/coach/avatar")
async def upload_coach_avatar(user_id: str = Query(...), file: UploadFile = File(...)):
    coach = db.coaches.find_one({"user_id": user_id})
    if not coach:
        raise HTTPException(status_code=404, detail="Тренер не знайдений")
    ext = os.path.splitext(file.filename)[1]
    fn = f"{user_id}{ext}"
    dst = os.path.join(AVATAR_DIR, fn)
    with open(dst, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    avatar_url = f"/avatars/{fn}"
    db.coaches.update_one({"user_id": user_id}, {"$set": {"avatar_url": avatar_url}})
    return {"avatar_url": avatar_url}

@app.post("/coach/review", response_model=Review)
async def submit_review(review: Review):
    existing = db.reviews.find_one({
        "coach_id": review.coach_id,
        "athlete_id": review.athlete_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Ви вже залишили відгук цьому тренеру")
    review.created_at = datetime.utcnow()
    db.reviews.insert_one(jsonable_encoder(review))
    return review

@app.put("/coach/review/{review_id}", response_model=Review)
async def update_review(review_id: str, payload: ReviewUpdate):
    try:
        rid = ObjectId(review_id)
    except:
        raise HTTPException(status_code=400, detail="Невірний ID відгуку")
    existing = db.reviews.find_one({"_id": rid})
    if not existing:
        raise HTTPException(status_code=404, detail="Відгук не знайдений")
    athlete_id = existing["athlete_id"]
    update_data = payload.dict()
    db.reviews.update_one({"_id": rid}, {"$set": update_data})
    updated = db.reviews.find_one({"_id": rid})
    ca = updated.get("created_at")
    created_str = ca.isoformat() if isinstance(ca, datetime) else str(ca)
    return Review(
        coach_id=updated["coach_id"],
        athlete_id=updated["athlete_id"],
        rating=updated["rating"],
        comment=updated.get("comment", ""),
        created_at=created_str
    )

@app.delete("/coach/review/{review_id}")
async def delete_review(review_id: str, athlete_id: str = Query(...)):
    try:
        rid = ObjectId(review_id)
    except:
        raise HTTPException(status_code=400, detail="Невірний ID відгуку")
    existing = db.reviews.find_one({"_id": rid})
    if not existing:
        raise HTTPException(status_code=404, detail="Відгук не знайдений")
    if existing["athlete_id"] != athlete_id:
        raise HTTPException(status_code=403, detail="Ви не можете видалити чужий відгук")
    db.reviews.delete_one({"_id": rid})
    return {"message": "Відгук видалено"}

@app.get("/coach/{coach_id}/reviews")
async def get_reviews(coach_id: str):
    cursor = db.reviews.find({"coach_id": coach_id})
    reviews = []
    total = 0
    sum_ratings = 0
    for r in cursor:
        r_id = str(r["_id"])
        ca = r.get("created_at")
        created_str = ca.isoformat() if isinstance(ca, datetime) else str(ca)
        ath = db.athletes.find_one({"user_id": r["athlete_id"]}, {"name":1, "_id":0})
        reviews.append({
            "id": r_id,
            "athlete_id": r["athlete_id"],
            "athlete_name": ath["name"] if ath else None,
            "rating": r["rating"],
            "comment": r.get("comment",""),
            "created_at": created_str
        })
        sum_ratings += r["rating"]
        total += 1
    average = round(sum_ratings/total, 2) if total>0 else None
    return {"reviews": reviews, "average_rating": average, "count": total}


@app.get("/athlete/profile")
async def get_athlete_profile(athlete_id: str = Query(...)):
    athlete = db.athletes.find_one({"user_id": athlete_id}, {"_id":0, "password":0})
    if not athlete:
        raise HTTPException(status_code=404, detail="Спортсмен не знайдений")
    athlete.setdefault("avatar_url", "/avatars/default.png")
    athlete.setdefault("phone", "")
    athlete.setdefault("description", "")
    athlete.setdefault("favorite_sports", [])
    return {"profile": athlete}

@app.put("/athlete/profile")
async def update_athlete_profile(payload: AthleteProfileUpdate):
    athlete = db.athletes.find_one({"user_id": payload.user_id})
    if not athlete:
        raise HTTPException(status_code=404, detail="Спортсмен не знайдений")
    update = {
        "name": payload.name,
        "age": payload.age,
        "phone": payload.phone,
        "description": payload.description,
        "favorite_sports": payload.favorite_sports
    }
    db.athletes.update_one({"user_id": payload.user_id}, {"$set": update})
    updated = db.athletes.find_one({"user_id": payload.user_id}, {"_id":0, "password":0})
    updated.setdefault("avatar_url", "/avatars/default.png")
    return {"profile": updated}

@app.post("/athlete/change-password")
async def change_athlete_password(req: ChangePasswordRequest):
    athlete = db.athletes.find_one({"user_id": req.user_id})
    if not athlete or not verify_password(req.old_password, athlete["password"]):
        raise HTTPException(status_code=401, detail="Невірний пароль")
    new_hash = hash_password(req.new_password)
    db.athletes.update_one({"user_id": req.user_id}, {"$set": {"password": new_hash}})
    return {"message": "Пароль оновлено"}

@app.post("/athlete/avatar")
async def upload_athlete_avatar(user_id: str = Query(...), file: UploadFile = File(...)):
    athlete = db.athletes.find_one({"user_id": user_id})
    if not athlete:
        raise HTTPException(status_code=404, detail="Спортсмен не знайдений")
    ext = os.path.splitext(file.filename)[1]
    fn = f"{user_id}{ext}"
    dst = os.path.join(AVATAR_DIR, fn)
    with open(dst, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    avatar_url = f"/avatars/{fn}"
    db.athletes.update_one({"user_id": user_id}, {"$set": {"avatar_url": avatar_url}})
    return {"avatar_url": avatar_url}


@app.get("/recommendations")
async def recommend(athlete_id: str = Query(...)):
    athlete = db.athletes.find_one({"user_id": athlete_id})
    if not athlete:
        raise HTTPException(status_code=404, detail="Спортсмен не знайдений")
    raw_trainings = list(db.trainings.find({
        "spots": {"$gt": 0},
        "participants": {"$ne": athlete_id},
        "start_time": {"$gt": datetime.utcnow()}
    }))

    trainings = []
    for t in raw_trainings:
        coach_id = t["coach_id"]
        agg = list(db.reviews.aggregate([
            {"$match": {"coach_id": coach_id}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
        ]))
        coach_rating = agg[0]["avg"] if agg else 0.0

        parts = list(db.athletes.find(
            {"user_id": {"$in": t.get("participants", [])}},
            {"age": 1, "_id": 0}
        ))
        if parts:
            avg_age = sum(p["age"] for p in parts) / len(parts)
        else:
            avg_age = athlete["age"]

        trainings.append({
            "id":                  str(t["_id"]),
            "price":               t["price"],
            "currency":            t["currency"],
            "coach_rating":        coach_rating,
            "avg_participant_age": avg_age,
            "section":             t["section"],
            "category":            t["category"],
            "spots":               t["spots"],
            "start_time":          t["start_time"],
            "end_time":            t["end_time"],
            "coach_id":            coach_id,
            "coach_name":          t.get("coach_name", "")
        })

    athlete_params = {
        "age": athlete["age"],
        "favorite_sections": athlete.get("favorite_sports", []),
        "favorite_categories": [
            cat for cat, secs in SPORT_CATEGORIES.items()
            if any(s in secs for s in athlete.get("favorite_sports", []))
        ]
    }
    recommendations = run_ga(trainings, athlete_params, K=5)
    return {"recommendations": recommendations}