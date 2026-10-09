from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 추천 로직 모듈
from backend.recommender import recommend_track_by_trait

import os
import pickle
import pandas as pd
import numpy as np

from sklearn.metrics.pairwise import cosine_similarity

# 프로젝트 기준 경로

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# 사전 로딩 데이터 (전역)
# 서비스 시작 시 한 번만 로딩하여 재사용

# 사람인 채용공고 데이터
saramin_df = pd.read_csv(
    os.path.join(BASE_DIR, "saramin_cluster_limited.csv")
)

# 채용공고 TF-IDF 모델
with open(os.path.join(BASE_DIR, "saramin_vectorizer.pkl"), "rb") as f:
    saramin_vectorizer = pickle.load(f)

with open(os.path.join(BASE_DIR, "saramin_tfidf.pkl"), "rb") as f:
    saramin_tfidf = pickle.load(f)


# FastAPI 앱 설정

app = FastAPI()

# 프론트엔드 연동을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 직무 트랙 추천 모델 로딩


# 군집-성향 유사도 결과
with open(os.path.join(BASE_DIR, "cluster_trait_scores.pkl"), "rb") as f:
    cluster_trait_scores = pickle.load(f)

# 군집별 트랙 이름
with open(os.path.join(BASE_DIR, "cluster_track_label.pkl"), "rb") as f:
    cluster_track_label = pickle.load(f)

TRAIT_ORDER = ["logic", "creative", "analysis", "stability"]

# 클러스터 성향 벡터 구성
cluster_trait_vectors = np.array([
    [cluster_trait_scores[cid][t] for t in TRAIT_ORDER]
    for cid in sorted(cluster_trait_scores.keys())
], dtype=float)

# 사용자 벡터와 동일 기준으로 정규화
cluster_trait_vectors = (
    cluster_trait_vectors
    - cluster_trait_vectors.mean(axis=1, keepdims=True)
)
cluster_trait_vectors = (
    cluster_trait_vectors
    / (np.linalg.norm(cluster_trait_vectors, axis=1, keepdims=True) + 1e-9)
)

# 요청 데이터 모델

class UserTrait(BaseModel):
    logic: int
    creative: int
    analysis: int
    stability: int






# API 엔드포인트


@app.post("/recommend")
def recommend(user: UserTrait):
    """
    설문 점수를 기반으로
    가장 적합한 개발자 트랙을 추천
    """
    scores = user.dict()

    result = recommend_track_by_trait(
        user_scores=scores,
        cluster_trait_vectors=cluster_trait_vectors,
        cluster_track_label=cluster_track_label
    )
    return result


@app.get("/jobs")
def get_jobs(query: str):
    """
    입력된 키워드를 기준으로
    사람인 채용공고 유사도 검색
    """
    q = (query or "").strip()
    if not q:
        return []

    q_vec = saramin_vectorizer.transform([q])
    sims = cosine_similarity(q_vec, saramin_tfidf).ravel()

    top_idx = sims.argsort()[::-1][:5]
    out = saramin_df.iloc[top_idx][
        ["job_title", "company", "region", "url"]
    ]
    return out.to_dict(orient="records")


@app.get("/debug/jobs")
def debug_jobs():
    """
    데이터 로딩 상태 확인용
    """
    return {
        "rows": len(saramin_df),
        "columns": list(saramin_df.columns)
    }
