# recommender.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# trait 벡터 순서 고정 (분석 코드와 반드시 동일해야 함)
TRAIT_ORDER = ["logic", "creative", "analysis", "stability"]



# 1) 사용자 점수 → trait 벡터 정규화

def normalize_user_vector(scores: dict):
    """
    scores 예시:
    {
        "logic": 12,
        "creative": 6,
        "analysis": 3,
        "stability": 9
    }
    """

    # (1) trait 순서에 맞게 벡터 생성
    u = np.array(
        [scores[t] for t in TRAIT_ORDER],
        dtype=float
    )

    # (2) 평균 제거 (센터링)
    u = u - u.mean()

    # (3) L2 정규화
    norm = np.linalg.norm(u) + 1e-9
    u = u / norm

    return u.reshape(1, -1)



# 2) 유사도 표시용 보정 함수 (UI 전용)

def calibrate_similarity(sim, lo=0.15, hi=0.55):
    """
    raw cosine similarity → 사람이 보기 좋은 0~1 범위로 보정
    """
    x = (sim - lo) / (hi - lo)
    x = max(0.0, min(1.0, x))
    return x



# 3) 추천 함수

def recommend_track_by_trait(
    user_scores: dict,
    cluster_trait_vectors,
    cluster_track_label
):
    """
    user_scores: 사용자 설문 점수
    cluster_trait_vectors: (num_clusters, 4) 정규화된 클러스터 trait 벡터
    cluster_track_label: {cluster_id: track_name}
    """

    # 사용자 벡터 생성
    user_vec = normalize_user_vector(user_scores)

    # 코사인 유사도 계산
    sims = cosine_similarity(user_vec, cluster_trait_vectors)[0]

    # 가장 유사한 클러스터
    best_cluster = int(sims.argmax())

    # raw / display 유사도 분리
    raw_sim = float(sims[best_cluster])

    return {
        "cluster_id": best_cluster,
        "track_name": cluster_track_label[best_cluster],

        # ✅ 내부 판단용 (모델 신뢰도)
        "similarity_raw": raw_sim,


        # 디버깅/확장용
        "all_similarities": {
            int(cid): float(sims[cid])
            for cid in range(len(sims))
        }
    }
